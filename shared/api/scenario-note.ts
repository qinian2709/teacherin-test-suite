import { test } from '@playwright/test';
import { SCENARIO_CATALOG } from './scenario-catalog.js';

/** 报告里挂上原场景的接口清单，执行步骤由用例自己写。 */
export function annotateScenarioApis(name: string): void {
  const item = SCENARIO_CATALOG.find((row) => row.name === name);
  const lines = (item?.apis ?? []).map(
    (api, i) => `${i + 1}. ${api.method} ${api.path} · ${api.name}`,
  );
  test.info().annotations.push({
    type: 'ms-apis',
    description: lines.length ? lines.join('\n') : `未找到场景清单：${name}`,
  });
}
