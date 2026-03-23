import { onRequest } from "firebase-functions/v2/https";
import { onSchedule } from "firebase-functions/v2/scheduler";
import * as admin from 'firebase-admin';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { ExceptionHandler } from './core/errors/app_error';

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

// 4. Register Feature Routers
app.use('/v1/habits', habitsRouter);
app.use('/v1/habits/logs', logsRouter);
app.use('/v1/sync', syncRouter);

// 5. Global Error Handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  const handledError = ExceptionHandler.handle(err);
  res.status(handledError.statusCode).json(handledError.toJSON());
});

// 6. Exportar como Firebase Function (v2)
export const api = onRequest({ region: "us-central1", memory: "256MiB" }, app);

// 7. Job Programado: Limpieza de logs (Domingos 23:59)
const logService = new HabitLogService(new HabitLogRepository());

export const cleanupOldLogsJob = onSchedule({
  schedule: 'every sunday 23:59',
  timeZone: 'America/Bogota',
  region: 'us-central1'
}, async (event) => {
  console.log('[JOBS]: Iniciando limpieza de logs globales...');
  
  const db = admin.firestore();
  const usersSnapshot = await db.collection('users').get();
  
  for (const userDoc of usersSnapshot.docs) {
    try {
      await logService.cleanupOldLogs(userDoc.id);
    } catch (error) {
      console.error(`[JOBS]: Error limpiando logs para usuario ${userDoc.id}:`, error);
    }
  }
  
  console.log('[JOBS]: Limpieza finalizada.');
});
