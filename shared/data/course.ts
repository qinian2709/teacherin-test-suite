import { type TestInfo } from '@playwright/test';
import { Endpoints } from '../api/endpoints.js';
import { loggedGet } from '../api/logged-call.js';
import type { DataRegistry } from './cleanup.js';
import type { ApiHelper } from '../fixtures/api-helper.js';
import {
  deleteCourse as destroyCourse,
  provisionOrgPublishedCourse,
  provisionPersonalCourse,
} from './course-provision.js';

export {
  buildCreateRepoPayload,
  buildCreatePersonalRepoPayload,
  buildCreateOrgRepoPayload,
  buildPublishPayload,
  buildMerchantPublishPayload,
  provisionPersonalCourse,
  provisionOrgCourse,
  provisionOrgPublishedCourse,
  provisionMerchantPublishedCourse,
  deleteCourse,
  deletePublishedOrgCourse,
  resolveTemplateIdAfterSave,
} from './course-provision.js';
export type { ProvisionedCourse, CourseOwnerKind, CreateRepoOverrides, CourseMediaUrls } from './course-provision.js';

export async function fetchCovers(
  api: ApiHelper,
  testInfo: TestInfo,
  apiBaseURL: string,
): Promise<void> {
  for (const id of ['2', '1'] as const) {
    await loggedGet(
      api,
      {
        testInfo,
        apiBaseURL,
        logName: `GET ${Endpoints.gallery.images(id)}`,
        assertions: ['图库应可访问'],
      },
      Endpoints.gallery.images(id),
    );
  }
}

/** @deprecated 用例请直接用 provisionPersonalCourse */
export async function createPersonalCourse(
  api: ApiHelper,
  _testInfo: TestInfo,
  _apiBaseURL: string,
  data: DataRegistry,
): Promise<string> {
  const course = await provisionPersonalCourse(api, data);
  return course.repoId;
}

/** @deprecated 组织场景请用 provisionOrgPublishedCourse */
export async function createOrgCourse(
  api: ApiHelper,
  _testInfo: TestInfo,
  _apiBaseURL: string,
  data: DataRegistry,
  orgId: string,
): Promise<string> {
  const course = await provisionOrgPublishedCourse(api, data, orgId);
  return course.repoId;
}

export async function deleteCourseLogged(
  api: ApiHelper,
  _testInfo: TestInfo,
  _apiBaseURL: string,
  repoId: string,
): Promise<void> {
  await destroyCourse(api, repoId);
}
