/**
 * Error extraction and handling helpers
 */

export class DisasterPlatformError extends Error {
  statusCode?: number;
  code?: string;

  constructor(message: string, statusCode?: number, code?: string) {
    super(message);
    this.name = 'DisasterPlatformError';
    this.statusCode = statusCode;
    this.code = code;
  }
}

export function getErrorMessage(error: unknown): string {
  if (error instanceof DisasterPlatformError) {
    return error.message;
  }
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === 'string') {
    return error;
  }
  return 'An unexpected system error occurred in telemetry processing.';
}
