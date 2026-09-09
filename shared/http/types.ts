/** HTTP 层原始结果。TeacherIn / Gitea 接口以 HTTP 状态为准，不一定有统一业务信封。 */
export interface HttpResult<T = unknown> {
  status: number;
  ok: boolean;
  data: T;
}

/** 可选业务信封：部分 TeacherIn 接口会返回 {code,msg,data}。 */
export interface ApiResponse<T = unknown> {
  code: number;
  msg: string;
  data: T;
}

export interface ListData<T = unknown> {
  total: number;
  list: T[];
  page: number;
  limit: number;
}

export const SUCCESS_CODE = 0;
export const ERR_UNAUTHORIZED = 401;

export function isEnvelope(value: unknown): value is ApiResponse {
  return (
    typeof value === 'object' &&
    value !== null &&
    'code' in value &&
    typeof (value as ApiResponse).code === 'number'
  );
}

export function isSuccess(resp: ApiResponse): boolean {
  return resp.code === SUCCESS_CODE;
}
