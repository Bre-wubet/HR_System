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
    if (value.body) Object.assign(req.body, value.body);
    if (value.params) Object.assign(req.params, value.params);
    if (value.query) Object.assign(req.query, value.query);
    return next();
  };
}


