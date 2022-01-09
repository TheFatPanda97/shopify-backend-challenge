/* eslint-disable import/prefer-default-export */
export class ValidationError extends Error {
  name;

  constructor(message) {
    super(message);
    this.name = 'ValidationError';
  }
}
