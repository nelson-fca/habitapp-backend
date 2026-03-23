/**
 * Definición de códigos de error alineados con Swagger
 */
export enum ErrorCode {
  UNAUTHORIZED = 'auth/unauthorized',
  FORBIDDEN = 'auth/forbidden',
  NOT_FOUND = 'resource/not-found',
  INTERNAL_ERROR = 'server/internal-error',
  INVALID_EMAIL = 'auth/invalid-email',
  WEAK_PASSWORD = 'auth/weak-password',
  EMAIL_IN_USE = 'auth/email-already-in-use',
  MISSING_FIELDS = 'validation/missing-fields',
}

/**
 * Clase base para excepciones personalizadas
 */
export class AppError extends Error {
  constructor(
    public readonly code: ErrorCode,
    public readonly message: string,
    public readonly statusCode: number = 400,
    public readonly details?: string
  ) {
    super(message);
    Object.setPrototypeOf(this, AppError.prototype);
  }

  /**
   * Formatea el error para la respuesta API (Swagger format)
   */
  toJSON() {
    return {
      error: {
        code: this.code,
        message: this.message,
        details: this.details || 'No se proporcionaron detalles adicionales.',
      },
    };
  }
}

/**
 * Manejador de excepciones centralizado (Mapping simple)
 */
export class ExceptionHandler {
  static handle(error: any): AppError {
    if (error instanceof AppError) {
      return error;
    }
    
    console.error('[CRITICAL ERROR]:', error);
    
    return new AppError(
      ErrorCode.INTERNAL_ERROR,
      'Ocurrió un error inesperado en el servidor.',
      500,
      error?.message
    );
  }
}
