const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 10;
const MAX_LIMIT = 100;

/**
 * Normaliza page/limit desde query params crudos (strings).
 * Nunca lanza error: si vienen mal, cae a los defaults — la paginación
 * no es un dato crítico como para bloquear la request por un valor raro.
 */
export function resolvePagination(rawPage, rawLimit) {
  const page = Math.max(1, parseInt(rawPage, 10) || DEFAULT_PAGE);
  const limit = Math.min(MAX_LIMIT, Math.max(1, parseInt(rawLimit, 10) || DEFAULT_LIMIT));
  const skip = (page - 1) * limit;

  return { page, limit, skip };
}

export function buildPaginationMeta({ page, limit, totalDocs }) {
  return {
    page,
    limit,
    totalDocs,
    totalPages: Math.ceil(totalDocs / limit) || 1,
  };
}