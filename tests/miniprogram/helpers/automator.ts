import path from 'node:path';

export function resolveMiniprogramProject(): string {
  return (
    process.env.MP_PROJECT?.trim() ||
    path.resolve(process.cwd(), '../teacherin-miniprogram/dist/build/mp-weixin')
  );
}
