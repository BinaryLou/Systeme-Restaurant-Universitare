const sanitizeValue = (val) => {
  if (typeof val === 'string') {
    return val.replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }
  if (Array.isArray(val)) {
    return val.map(sanitizeValue);
  }
  if (val !== null && typeof val === 'object') {
    const sanitizedObj = {};
    for (const key in val) {
      sanitizedObj[key] = sanitizeValue(val[key]);
    }
    return sanitizedObj;
  }
  return val;
};

const customSecurityMiddleware = (req, res, next) => {
  // Simple XSS sanitization (recursive on body, params, query)
  if (req.body) req.body = sanitizeValue(req.body);
  
  // For params and query in Express 5, we can't reassign the object itself (it's a getter),
  // but we can mutate its properties.
  if (req.params) {
    for (const key in req.params) {
      req.params[key] = sanitizeValue(req.params[key]);
    }
  }
  if (req.query) {
    for (const key in req.query) {
      // HPP Protection: If an array is passed in query where we expect a string,
      // take the last element (like hpp does)
      let val = req.query[key];
      if (Array.isArray(val)) {
        val = val[val.length - 1];
      }
      req.query[key] = sanitizeValue(val);
    }
  }
  
  next();
};

module.exports = customSecurityMiddleware;
