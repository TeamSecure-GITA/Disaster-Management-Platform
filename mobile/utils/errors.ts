export class DisasterAppError extends Error {
  code: string;
  isOperational: boolean;

  constructor(message: string, code: string = 'GENERIC_ERROR', isOperational: boolean = true) {
    super(message);
    this.name = 'DisasterAppError';
    this.code = code;
    this.isOperational = isOperational;
  }
}
