class BackError extends Error {
  constructor(statusCode, message, code = "BAD_REQUEST") {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
  }
}

module.exports = BackError;