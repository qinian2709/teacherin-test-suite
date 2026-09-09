import { createLogger } from '../utils/logger.js';

const log = createLogger('data');

export type CleanupTask = () => Promise<void> | void;

/**
 * 测试数据登记表：用例创建数据时登记清理动作，结束后统一回收。
 */
export class DataRegistry {
  private readonly tasks: { label: string; task: CleanupTask }[] = [];

  register(label: string, task: CleanupTask): void {
    this.tasks.push({ label, task });
  }

  async runAll(): Promise<void> {
    while (this.tasks.length > 0) {
      const item = this.tasks.pop()!;
      try {
        await item.task();
        log.debug(`清理成功：${item.label}`);
      } catch (err) {
        log.warn(`清理失败（忽略）：${item.label}`, err);
      }
    }
  }

  get size(): number {
    return this.tasks.length;
  }
}
