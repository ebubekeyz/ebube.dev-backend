import { StatusCodes } from 'http-status-codes';

const errorHandlerMiddleware = (err, req, res, next) => {
  let customError = {
    statusCode: err.statusCode || StatusCodes.INTERNAL_SERVER_ERROR,
    msg: err.message || 'Something went wrong, Please try again',
  };

  if (err.name === 'ValidationError') {
    customError.msg = Object.values(err.errors)
      .map((item) => item.message)
      .join(',');
    customError.statusCode = 404;
  }

  if (err.code && err.code === 11000) {
    customError.msg = `Duplicate value entered for id ${Object.values(
      err.value
    )} field, please try another value`;
    customError.statusCode = 404;
  }
  if (err.name === 'castError') {
    customError.msg = `No item found with id ${err.value}`;
    customError.statusCode = 404;
  }

  return res.status(customError.statusCode).json({ msg: customError.msg });
};

export default errorHandlerMiddleware;
