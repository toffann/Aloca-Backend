const errorHandler = (err, req, res, next) => {
  console.error(err.stack);
  
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  res.status(statusCode).json({
    status: 'error',
    statusCode,
    message,
    // stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
};

const notFoundHandler = (req, res, next) => {
  res.status(404).json({
    status: 'error',
    statusCode: 404,
    message: 'Resource not found'
  });
};

module.exports = {
  errorHandler,
  notFoundHandler
};