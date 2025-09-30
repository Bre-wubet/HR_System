// Generic request validation middleware for Joi schemas
export function validate(schema) {
  return (req, _res, next) => {
    const payload = { body: req.body, params: req.params, query: req.query };
    const { error, value } = schema.validate(payload, { abortEarly: false, allowUnknown: true, stripUnknown: true });
    if (error) {
      const err = new Error("Validation failed");
      err.status = 400;
      err.details = error.details?.map((d) => d.message);
      return next(err);
    }
    req.body = value.body || req.body;
    req.params = value.params || req.params;
    req.query = value.query || req.query;
    return next();
  };
}


