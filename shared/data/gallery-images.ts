import { Endpoints } from '../api/endpoints.js';
import type { ApiHelper } from '../fixtures/api-helper.js';
import { INFRA_API_OPTS } from './infra.js';
import { MS_FALLBACK_COVER_PATH } from './ms-course-templates.js';

export interface GalleryImageUrls {
  coverUrl: string;
  backgroundUrl: string;
}

/** MS JSONPath: $.data[*].images[*].imageUrl */
function extractImageUrls(body: unknown): string[] {
  if (!body || typeof body !== 'object') return [];
  const root = body as Record<string, unknown>;
  const data = root.data;
  if (!Array.isArray(data)) return [];

  const urls: string[] = [];
  for (const category of data) {
    if (!category || typeof category !== 'object') continue;
    const images = (category as { images?: unknown }).images;
    if (!Array.isArray(images)) continue;
    for (const image of images) {
      if (!image || typeof image !== 'object') continue;
      const url = (image as { imageUrl?: unknown }).imageUrl;
      if (typeof url === 'string' && url.length > 0) urls.push(url);
    }
  }
  return urls;
}

/**
 * MS 流程：GET gallery/2 → cover，GET gallery/1 → background。
 * case 58afaeb7 / 282f1e80。
 */
export async function resolveGalleryImages(api: ApiHelper): Promise<GalleryImageUrls> {
  const [coverRes, backgroundRes] = await Promise.all([
    api.get(Endpoints.gallery.images('2'), INFRA_API_OPTS),
    api.get(Endpoints.gallery.images('1'), INFRA_API_OPTS),
  ]);

  const coverUrls = extractImageUrls(coverRes.body);
  const backgroundUrls = extractImageUrls(backgroundRes.body);

  return {
    coverUrl: coverUrls[0] ?? MS_FALLBACK_COVER_PATH,
    backgroundUrl: backgroundUrls[0] ?? '',
  };
}
