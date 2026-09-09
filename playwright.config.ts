import { defineConfig, devices } from '@playwright/test';
import { env } from './config/index.js';

const isCI = !!process.env.CI;
const runMiniprogram = process.env.RUN_MP === '1' && !isCI;
const htmlReportFolder = process.env.PLAYWRIGHT_HTML_REPORT_DIR || 'reports/latest/html';
const junitReportFile = process.env.PLAYWRIGHT_JUNIT_REPORT_FILE || 'reports/latest/junit.xml';
const allureResultsDir = process.env.ALLURE_RESULTS_DIR || 'reports/latest/allure-results';
const artifactsDir = process.env.PLAYWRIGHT_ARTIFACTS_DIR || 'reports/latest/artifacts';
const enhancedReportDir = process.env.PLAYWRIGHT_ENHANCED_REPORT_DIR || 'reports/latest/enhanced';

export default defineConfig({
  testDir: 'tests',
  fullyParallel: true,
  forbidOnly: isCI,
  retries: isCI ? 2 : 0,
  workers: isCI ? 4 : undefined,
  timeout: 60_000,
  expect: { timeout: 10_000 },
  reporter: [
    ['list'],
    [
      'playwright-enhanced-reporter',
      {
        outputDir: enhancedReportDir,
        outputFile: 'enhanced-report.html',
        title: 'TeacherIn · Test Report',
        openReport: false,
        theme: 'light',
        includeCharts: true,
        includeTrends: false,
        enableTimeline: false,
        enableStabilityScore: false,
        enableFailureClustering: false,
        enableRunComparison: false,
        enableSpeedboard: false,
        enablePdfExport: false,
        dashboardWidgets: {
          overview: true,
          environment: false,
          metrics: false,
          details: false,
          suites: true,
          charts: false,
          categories: false,
          performance: false,
          insights: false,
          timeline: false,
          speedboard: false,
          stability: false,
          failureClusters: false,
          comparison: false,
          apiPayloads: false,
          trends: false,
        },
      },
    ],
    ['html', { outputFolder: htmlReportFolder, open: 'never' }],
    ['junit', { outputFile: junitReportFile }],
    ['allure-playwright', { resultsDir: allureResultsDir, detail: true }],
  ],
  outputDir: artifactsDir,
  use: {
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    actionTimeout: 15_000,
    ignoreHTTPSErrors: true,
  },
  projects: [
    {
      name: 'api',
      testDir: 'tests/api',
      fullyParallel: false,
      workers: 1,
      use: {
        baseURL: env.apiBaseURL,
        extraHTTPHeaders: {
          'Content-Type': 'application/json',
        },
      },
    },
    {
      name: 'e2e-web',
      testDir: 'tests/e2e-web',
      use: {
        ...devices['Desktop Chrome'],
        baseURL: env.webBaseURL,
        viewport: { width: 1440, height: 900 },
      },
    },
    {
      name: 'e2e-mobile',
      testDir: 'tests/e2e-mobile',
      use: {
        ...devices['Pixel 5'],
        baseURL: env.mobileBaseURL,
      },
    },
    ...(runMiniprogram
      ? [
          {
            name: 'miniprogram',
            testDir: 'tests/miniprogram',
            fullyParallel: false,
            workers: 1,
            timeout: 120_000,
          },
        ]
      : []),
  ],
});
