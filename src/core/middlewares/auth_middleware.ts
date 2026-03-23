import * as admin from 'firebase-admin';
import { Request, Response, NextFunction } from 'express';
import { AppError, ErrorCode } from '../errors/app_error';

/**
 * Extendemos la interfaz de Request para incluir el userId (UID)
 */
export interface AuthenticatedRequest extends Request {
  user?: {
    uid: string;
    email?: string;
  };
}

/**
 * Middleware para validar el Token de Firebase
 */
export const authMiddleware = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next(new AppError(ErrorCode.UNAUTHORIZED, 'No se proporcionó un token de autenticación.', 401));
  }

  const idToken = authHeader.split('Bearer ')[1];

  try {
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    req.user = {
      uid: decodedToken.uid,
      email: decodedToken.email,
    };
    return next();
  } catch (error) {
    console.error('[AUTH_MIDDLEWARE]: Error verificando token:', error);
    return next(new AppError(ErrorCode.UNAUTHORIZED, 'Token inválido o expirado.', 401));
  }
};
