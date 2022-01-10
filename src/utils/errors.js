/**
 * @constructor message - Error message
 * @description A custom validation error class that extends the built-in Error class
 * @example
 */
// eslint-disable-next-line import/prefer-default-export
export class ValidationError extends Error {
  constructor(message) {
    super(message);
    this.name = 'ValidationError';
  }
}
