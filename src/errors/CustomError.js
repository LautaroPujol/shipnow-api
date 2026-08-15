class CustomError extends Error {
  constructor({ type, message, statusCode, details = null }) {
    super(message);
    this.name = 'CustomError';
    this.type = type;
    this.statusCode = statusCode;
    this.details = details;
  }
}

export default CustomError;