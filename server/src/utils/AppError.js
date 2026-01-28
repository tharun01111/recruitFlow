class AppError extends Error {
  constructor(message, statusCode, details = {}) {
    super(message);

    this.statusCode = statusCode;
    this.status = statusCode >= 400 && statusCode < 500 ? 'fail' : 'error';
    this.details = details;

    // Marks this as a trusted, operational error
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

export default AppError;
