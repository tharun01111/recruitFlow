import mongoose from 'mongoose';
import AppError from '../utils/AppError.js';

const validateObjectId = (paramName = 'id') => {
  return (req, res, next) => {
    const value = req.params[paramName];

    if (!value) {
      return next(
        new AppError(
          `Missing required parameter: ${paramName}.`,
          400,
          {
            expected: `URL parameter '${paramName}'`,
            received: 'nothing',
            action: `Provide a valid '${paramName}' in the request URL`
          }
        )
      );
    }

    if (!mongoose.Types.ObjectId.isValid(value)) {
      return next(
        new AppError(
          'Invalid ID format.',
          400,
          {
            expected: 'valid MongoDB ObjectId',
            received: value,
            action: 'Check the ID and try again'
          }
        )
      );
    }

    next();
  };
};

export default validateObjectId;
