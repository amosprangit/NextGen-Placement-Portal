/**
 * Reads ?page= & ?limit= from the query string with sane defaults/limits,
 * and returns both the mongoose skip/limit values and a meta object to
 * send back to the client.
 */
const getPagination = (query) => {
  const page = Math.max(parseInt(query.page, 10) || 1, 1);
  const limit = Math.min(Math.max(parseInt(query.limit, 10) || 20, 1), 100);
  const skip = (page - 1) * limit;
  return { page, limit, skip };
};

const buildMeta = ({ page, limit, total }) => ({
  page,
  limit,
  total,
  totalPages: Math.ceil(total / limit) || 1,
});

module.exports = { getPagination, buildMeta };
