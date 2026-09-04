/**
 * Small helper so every endpoint returns the same envelope shape:
 * { success, message, data, meta } — makes the frontend's API layer
 * predictable regardless of which controller answered.
 */
const sendResponse = (res, statusCode, { success = true, message = '', data = null, meta = null }) => {
  const body = { success, message };
  if (data !== null) body.data = data;
  if (meta !== null) body.meta = meta;
  return res.status(statusCode).json(body);
};

class ApiError extends Error {
  constructor(statusCode, message, errors = null) {
    super(message);
    this.statusCode = statusCode;
    this.errors = errors;
  }
}

module.exports = { sendResponse, ApiError };
