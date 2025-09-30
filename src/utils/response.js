export const response = {
  success(data, meta) {
    return { success: true, data, meta: meta || undefined };
  },
  error(message, code = 500, details) {
    return { success: false, error: { message, code, details: details || undefined } };
  },
};


