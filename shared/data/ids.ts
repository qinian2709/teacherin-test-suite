export function pickStringField(
  row: Record<string, unknown> | undefined,
  ...keys: string[]
): string | undefined {
  if (!row) return undefined;
  for (const key of keys) {
    const value = row[key];
    if (typeof value === 'string' && value.length > 0) return value;
  }
  return undefined;
}

export function pickNumericId(body: unknown): string | undefined {
  if (typeof body === 'number' && Number.isFinite(body) && body > 0) return String(body);
  if (!body || typeof body !== 'object') return undefined;
  const root = body as Record<string, unknown>;
  const data = root.data;
  if (typeof data === 'number' && Number.isFinite(data) && data > 0) return String(data);
  const nested =
    data && typeof data === 'object' ? (data as Record<string, unknown>) : root;
  for (const key of ['id', 'ID', 'repo_id', 'repoId', 'repoID', 'goodsID', 'uid', 'user_id', 'template_id']) {
    const value = nested[key];
    if (typeof value === 'number' && Number.isFinite(value) && value > 0) return String(value);
    if (typeof value === 'string' && /^\d+$/.test(value) && value !== '0') return value;
  }
  return undefined;
}

function unwrapList(body: unknown): unknown[] {
  if (!body || typeof body !== 'object') return [];
  const root = body as Record<string, unknown>;
  const data = root.data ?? root;
  if (Array.isArray(data)) return data;
  if (data && typeof data === 'object') {
    const nested = data as Record<string, unknown>;
    for (const key of ['list', 'repos', 'templates', 'data', 'items']) {
      const value = nested[key];
      if (Array.isArray(value)) return value;
    }
  }
  return [];
}

function pickRepoName(item: unknown): string | undefined {
  if (!item || typeof item !== 'object') return undefined;
  const row = item as Record<string, unknown>;
  for (const key of ['name', 'repo_name', 'repoName']) {
    const value = row[key];
    if (typeof value === 'string' && value.length > 0) return value;
  }
  return undefined;
}

/** 从列表响应中按名称匹配 repo/template id（存模板响应常无 id，需回查列表）。 */
export function pickRepoIdByName(body: unknown, name: string): string | undefined {
  for (const item of unwrapList(body)) {
    if (pickRepoName(item) !== name) continue;
    const id = pickNumericId(item);
    if (id) return id;
  }
  return undefined;
}

/** 从模版/课程列表响应中取第一个 repo/template id。 */
export function pickFirstRepoId(body: unknown): string | undefined {
  for (const item of unwrapList(body)) {
    const id = pickNumericId(item);
    if (id) return id;
  }
  return pickNumericId(body);
}

/** 从推广/分销商品列表取课程 repoID（spread/goods 用 originalRepoID）。 */
export function pickDistributionRepoId(body: unknown): string | undefined {
  for (const item of unwrapList(body)) {
    if (!item || typeof item !== 'object') continue;
    const row = item as Record<string, unknown>;
    const repoId =
      row.originalRepoID ??
      row.originalRepoId ??
      row.original_repo_id ??
      row.repoID ??
      row.repoId ??
      row.repo_id;
    if (typeof repoId === 'number' && repoId > 0) return String(repoId);
    if (typeof repoId === 'string' && /^\d+$/.test(repoId) && repoId !== '0') return repoId;
  }
  return undefined;
}

/** 从 GET /orgs/{orgid}/license 列表取 license 记录 id（可按 phone 或 licensee_id 匹配）。 */
export function pickLicenseId(
  body: unknown,
  match?: { phone?: string; licenseeId?: string },
): string | undefined {
  for (const item of unwrapList(body)) {
    if (!item || typeof item !== 'object') continue;
    const row = item as Record<string, unknown>;
    if (match?.licenseeId) {
      const licenseeId = row.licensee_id ?? row.licenseeId;
      if (String(licenseeId) !== match.licenseeId) continue;
    } else if (match?.phone) {
      const phone = row.phone_number ?? row.phoneNumber;
      if (typeof phone !== 'string') continue;
      const normalized = phone.replace(/\D/g, '');
      const target = match.phone.replace(/\D/g, '');
      if (!normalized.endsWith(target) && !target.endsWith(normalized)) continue;
    }
    const id = row.id ?? row.ID;
    if (typeof id === 'number' && id > 0) return String(id);
    if (typeof id === 'string' && /^\d+$/.test(id)) return id;
  }
  return pickNumericId(body);
}

/** 从 topics/category 取第一个 topic id。 */
export function pickFirstTopicId(body: unknown): number | undefined {
  const lists: unknown[] = [];
  if (body && typeof body === 'object') {
    const root = body as Record<string, unknown>;
    const data = root.data ?? root;
    if (Array.isArray(data)) lists.push(...data);
    else if (data && typeof data === 'object') {
      const nested = data as Record<string, unknown>;
      for (const key of ['list', 'topics', 'data']) {
        const value = nested[key];
        if (Array.isArray(value)) lists.push(...value);
      }
    }
  }
  for (const item of lists) {
    if (!item || typeof item !== 'object') continue;
    const row = item as Record<string, unknown>;
    const id = row.id ?? row.topic_id;
    if (typeof id === 'number' && id > 0) return id;
  }
  return undefined;
}
