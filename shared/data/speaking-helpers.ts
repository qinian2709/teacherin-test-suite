/**
 * 口语卡 create/import 响应 → LMS speakingCard 数组。
 */
import { uniqueName } from '../utils/random.js';

export interface LmsSpeakingCardPayload {
  content: string;
  phonetic: string;
  paraphrase: string;
  audio: { fileId: number; duration: string; path: string }[];
  imageFileId: number;
  imagePath: string;
}

function unwrapSpeakingList(body: unknown): Record<string, unknown>[] {
  if (!body || typeof body !== 'object') return [];
  const root = body as Record<string, unknown>;
  const data = root.data ?? body;
  if (!Array.isArray(data)) return [];
  return data.filter((item): item is Record<string, unknown> => Boolean(item && typeof item === 'object'));
}

/** import/create 响应里的卡片条数（含 errno 项，用于断言 import 已处理请求） */
export function countSpeakingCardsInResponse(body: unknown): number {
  return unwrapSpeakingList(body).length;
}

/** POST /repos/speaking/create | import 响应 → LMS speakingCard[] */
export function pickSpeakingCardsFromResponse(body: unknown): LmsSpeakingCardPayload[] {
  const cards: LmsSpeakingCardPayload[] = [];
  for (const row of unwrapSpeakingList(body)) {
    const errno = row.errno ?? row.Errno;
    if (Array.isArray(errno) && errno.length > 0) continue;

    const content = row.content ?? row.sourceContent;
    if (typeof content !== 'string' || content.length === 0) continue;

    const audioRaw = row.audio;
    const audio = Array.isArray(audioRaw)
      ? audioRaw.map((item) => {
          const a = item as Record<string, unknown>;
          return {
            fileId: Number(a.fileId ?? a.file_id ?? 0),
            duration: String(a.duration ?? '0'),
            path: String(a.path ?? ''),
          };
        })
      : [];

    cards.push({
      content,
      phonetic: String(row.phonetic ?? ''),
      paraphrase: String(row.paraphrase ?? ''),
      audio,
      imageFileId: 0,
      imagePath: '',
    });
  }
  return cards;
}

/**
 * LMS 口语卡活动：优先 import（含 TTS 音频），import 全失败时回退 create（ignoreTTS）。
 * import 依赖 ClassIn TTS；create 不依赖，保证 LMS 步骤可稳定跑通。
 */
export function resolveSpeakingCardsForLms(
  importBody: unknown,
  createBody: unknown,
): LmsSpeakingCardPayload[] {
  const fromImport = pickSpeakingCardsFromResponse(importBody);
  if (fromImport.length > 0) return fromImport;
  return pickSpeakingCardsFromResponse(createBody);
}

/** POST /repos/{repoid}/lms — 新建 AI 口语卡活动（type=10） */
export function buildSpeakingLmsPayload(
  unitId: string,
  speakingCards: LmsSpeakingCardPayload[],
  activityName?: string,
): Record<string, unknown> {
  return {
    lmsData: {
      activityName: activityName ?? `API口语卡${uniqueName('')}`,
      desc: '',
      actPublishFlag: 2,
      type: 10,
      unitPublishFlag: 2,
      unitName: '未命名单元',
      abilityIds: [],
      scoreType: 0,
      fullScore: 100,
      customScoreId: '1',
      speakingCard: speakingCards,
      audio: [],
      video: [],
      docs: [],
      image: [],
    },
    lmsPosition: [unitId, '0'],
    targetUnitId: '-1',
  };
}
