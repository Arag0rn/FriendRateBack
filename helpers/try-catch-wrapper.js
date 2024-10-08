export const tryCatchWrapper = (cb) => (req, res, next) => {
  return cb(req, res, next).catch((err) => next(err));
};

