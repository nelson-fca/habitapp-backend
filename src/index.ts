import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { AppError, ErrorCode, ExceptionHandler } from './core/errors/app_error';

// 1. Inicializar Firebase Admin
admin.initializeApp();

// 2. Configurar Express
const app = express();

// Middlewares estándar
app.use(cors({ origin: true }));
app.use(helmet());
app.use(express.json());

// 3. Rutas base (Health Check)
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'HabitApp API is running.' });
});

import { habitsRouter } from './features/habits/infrastructure/habit_controller';
import { logsRouter } from './features/habits/infrastructure/habit_log_controller';
import { syncRouter } from './features/sync/infrastructure/sync_controller';
import { HabitLogService } from './features/habits/application/habit_log_service';
import { HabitLogRepository } from './features/habits/infrastructure/habit_log_repository';

// ... (admin already init)

// 4. Register Feature Routers
app.use('/v1/habits', habitsRouter);
app.use('/v1/habits/logs', logsRouter);
app.use('/v1/sync', syncRouter);

// 5. Global Error Handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  const handledError = ExceptionHandler.handle(err);
  res.status(handledError.statusCode).json(handledError.toJSON());
});

// 6. Exportar como Firebase Function
export const api = functions.https.onRequest(app);

// 7. Job Programado: Limpieza de logs (Domingos 23:59)
// Borra registros mayores a 15 días para optimizar Firestore.
const logService = new HabitLogService(new HabitLogRepository());

export const cleanupOldLogsJob = functions.pubsub
  .schedule('every sunday 23:59')
  .timeZone('America/Bogota')
  .onRun(async (context) => {
    console.log('[JOBS]: Iniciando limpieza de logs globales...');
    
    // Obtenemos todos los usuarios (Simplificado)
    // En producción masiva, usaríamos un cursor o shard-id
    const usersSnapshot = await admin.firestore().collection('users').get();
    
    for (const userDoc of usersSnapshot.docs) {
      await logService.cleanupOldLogs(userDoc.id);
    }
    
    console.log('[JOBS]: Limpieza finalizada.');
    return null;
  });
