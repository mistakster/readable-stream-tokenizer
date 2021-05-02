export class FinishedStreamError extends Error {
  constructor(message) {
    super(message);
    this.name = 'FinishedStreamError';
  }
}
