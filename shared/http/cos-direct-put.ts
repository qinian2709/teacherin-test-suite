/**
 * 腾讯云 COS 直传 — 纯 HTTP（fetch + crypto 签名），**不依赖任何 COS SDK**。
 *
 * 规范：接口测试中凡涉及 COS/OSS 等外部存储，一律在此类模块用 HTTP 实现，禁止引入 npm SDK。
 * 页面上传本地文件亦走此步；TeacherIn 只提供 token 与 POST /repos/{id}/cos 登记。
 */
import { createHash, createHmac } from 'node:crypto';

export interface CosTempCredentials {
  TmpSecretId: string;
  TmpSecretKey: string;
  Token?: string;
}

export interface CosPutParams {
  buffer: Buffer;
  objectKey: string;
  bucket: string;
  region: string;
  /** ClassIn 返回的自定义域名，PUT 目标 host */
  domain: string;
  credentials: CosTempCredentials;
}

function camSafeUrlEncode(str: string): string {
  return encodeURIComponent(str)
    .replace(/!/g, '%21')
    .replace(/'/g, '%27')
    .replace(/\(/g, '%28')
    .replace(/\)/g, '%29')
    .replace(/\*/g, '%2A');
}

function getObjectKeys(obj: Record<string, string>, lowerCaseKey: boolean): string[] {
  return Object.keys(obj)
    .sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()))
    .map((key) => (lowerCaseKey ? camSafeUrlEncode(key).toLowerCase() : key));
}

function obj2str(obj: Record<string, string>, lowerCaseKey: boolean): string {
  const parts: string[] = [];
  for (const key of getObjectKeys(obj, lowerCaseKey)) {
    const rawKey = Object.keys(obj).find((k) => k.toLowerCase() === key.toLowerCase()) ?? key;
    const val = obj[rawKey] ?? '';
    const encodedKey = lowerCaseKey ? camSafeUrlEncode(rawKey).toLowerCase() : camSafeUrlEncode(rawKey);
    parts.push(`${encodedKey}=${camSafeUrlEncode(String(val))}`);
  }
  return parts.join('&');
}

/** 腾讯云 COS 签名（与 cos-nodejs-sdk util.getAuth 一致） */
function buildCosAuthorization(options: {
  method: string;
  pathname: string;
  headers: Record<string, string>;
  secretId: string;
  secretKey: string;
  bucket: string;
  region: string;
}): string {
  const now = Math.floor(Date.now() / 1000) - 1;
  const exp = now + 900;
  const qSignTime = `${now};${exp}`;
  const qKeyTime = qSignTime;
  const signHeaders = new Set([
    'cache-control',
    'content-disposition',
    'content-encoding',
    'content-length',
    'content-md5',
    'content-type',
    'host',
    'x-cos-security-token',
  ]);

  const signedHeaders: Record<string, string> = {};
  for (const [key, value] of Object.entries(options.headers)) {
    const lower = key.toLowerCase();
    if (lower.startsWith('x-cos-') || lower.startsWith('x-ci-') || signHeaders.has(lower)) {
      signedHeaders[key] = value;
    }
  }
  if (!signedHeaders.Host && !signedHeaders.host) {
    signedHeaders.Host = `${options.bucket}.cos.${options.region}.myqcloud.com`;
  }

  const qHeaderList = getObjectKeys(signedHeaders, true).join(';');
  const formatString = [
    options.method.toLowerCase(),
    options.pathname.startsWith('/') ? options.pathname : `/${options.pathname}`,
    '',
    obj2str(signedHeaders, true),
    '',
  ].join('\n');
  const hashedFormat = createHash('sha1').update(formatString, 'utf8').digest('hex');
  const stringToSign = ['sha1', qSignTime, hashedFormat, ''].join('\n');
  const signKey = createHmac('sha1', options.secretKey).update(qKeyTime).digest('hex');
  const qSignature = createHmac('sha1', signKey).update(stringToSign).digest('hex');

  return [
    'q-sign-algorithm=sha1',
    `q-ak=${options.secretId}`,
    `q-sign-time=${qSignTime}`,
    `q-key-time=${qKeyTime}`,
    `q-header-list=${qHeaderList}`,
    'q-url-param-list=',
    `q-signature=${qSignature}`,
  ].join('&');
}

/** PUT 二进制到 COS，返回登记 /repos/cos 用的 path（以 / 开头） */
export async function putObjectToCos(params: CosPutParams): Promise<string> {
  const key = params.objectKey.replace(/^\//, '');
  const pathname = `/${key}`;
  const host = `${params.bucket}.cos.${params.region}.myqcloud.com`;
  const putUrl = `https://${params.domain}${pathname}`;

  const headers: Record<string, string> = {
    Host: host,
    'Content-Length': String(params.buffer.byteLength),
  };
  if (params.credentials.Token) {
    headers['x-cos-security-token'] = params.credentials.Token;
  }

  const authorization = buildCosAuthorization({
    method: 'put',
    pathname,
    headers,
    secretId: params.credentials.TmpSecretId,
    secretKey: params.credentials.TmpSecretKey,
    bucket: params.bucket,
    region: params.region,
  });

  const response = await fetch(putUrl, {
    method: 'PUT',
    headers: {
      ...headers,
      Authorization: authorization,
    },
    body: params.buffer,
  });

  if (!response.ok) {
    const text = await response.text().catch(() => '');
    throw new Error(`COS PUT 失败 HTTP ${response.status}${text ? `: ${text.slice(0, 200)}` : ''}`);
  }

  return pathname;
}
