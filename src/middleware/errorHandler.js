const errorHandler = (err, req, res, next) => {
  console.error('Error:', err.message);

  if (err.name === 'SequelizeValidationError') {
    const errors = err.errors.map((e) => e.message);
    return res.status(400).json({ error: 'Validation error', details: errors });
  }

  if (err.name === 'SequelizeUniqueConstraintError') {
    const errors = err.errors.map((e) => e.message);
    return res.status(409).json({ error: 'Duplicate entry', details: errors });
  }

  if (err.name === 'SequelizeForeignKeyConstraintError') {
    return res.status(400).json({ error: 'Referenced resource does not exist.' });
  }

  const statusCode = err.statusCode || 500;
  const message = statusCode === 500 ? 'Internal server error' : err.message;

  res.status(statusCode).json({ error: message });
};

module.exports = errorHandler;
