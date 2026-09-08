// 企业微信机器人告警（可选）。webhook 从环境变量注入。
export function wecomWebhook(): string {
  return process.env.WECOM_WEBHOOK ?? '';
}

export async function notifyWecom(message: string): Promise<void> {
  const url = wecomWebhook();
  if (!url) return;
  await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ msgtype: 'text', text: { content: message } }),
  });
}
