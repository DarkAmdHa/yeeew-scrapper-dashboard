export const notFound = (req, res, next) => {
  const error = new Error(`Not Found - ${req.originalUrl}`);
  res.status(404);
  next(error);
};

export const errorHandler = (err, req, res, next) => {
  //Sometimes, error will have a 200 status code, even though there's an error.
  //for instance, if the error was manually thrown without setting a res.status:
  const errorCode = res.statusCode === 200 ? 500 : res.statusCode;

  res.status(errorCode).json({
    message: err.message,
    stackTrace: process.env.NODE_ENV === "production" ? null : err.stack,
  });
};
