import AppError from '../utils/AppError.js';

const sendErrorDev = (err, res) => {
  res.status(err.statusCode || 500).json({
    status: err.status || 'fail',
    message: err.message,
    details: err.details || undefined,
    stack: err.stack
  });
};

const sendErrorProd = (err, res) => {
  // * Operational, contract-aware error
  if (err.isOperational) {
    return res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
      ...(err.details && Object.keys(err.details).length > 0 && {
        details: err.details
      })
    });
  }

  //  Unknown / programming error
  console.error(' UNEXPECTED ERROR:', err);

  return res.status(500).json({
    status: 'fail',
    message: 'Something went wrong on the server.'
  });
};

const errorHandler = (err, req, res, next) => {
  let error = err;

  // Normalize unknown errors
  if (!(error instanceof AppError)) {
    error = new AppError(
      'Something went wrong on the server.',
      500
    );
  }

  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(error, res);
  } else {
    sendErrorProd(error, res);
  }
};

export default errorHandler;
