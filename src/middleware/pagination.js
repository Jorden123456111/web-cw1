const MAX_PAGE_LIMIT = 100;
const DEFAULT_PAGE_LIMIT = 20;

const sanitisePagination = (req, res, next) => {
  let page = parseInt(req.query.page) || 1;
  let limit = parseInt(req.query.limit) || DEFAULT_PAGE_LIMIT;

  if (page < 1) page = 1;
  if (limit < 1) limit = DEFAULT_PAGE_LIMIT;
  if (limit > MAX_PAGE_LIMIT) limit = MAX_PAGE_LIMIT;

  req.pagination = { page, limit, offset: (page - 1) * limit };
  next();
};

module.exports = { sanitisePagination, MAX_PAGE_LIMIT, DEFAULT_PAGE_LIMIT };
