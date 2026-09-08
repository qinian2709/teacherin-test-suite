// 命令行快速跑一个 API 探测（不依赖 Playwright）。
import { api } from '../shared/api';

async function main(): Promise<void> {
  const swagger = await api.swagger.get();
  console.log('swagger status:', swagger.status);

  const user = await api.user.info();
  console.log('user info status:', user.status);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
