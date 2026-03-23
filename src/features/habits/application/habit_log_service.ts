import { HabitLogModel, PushHabitLogDTO } from '../domain/habit_log_model';
import { HabitLogRepository } from '../infrastructure/habit_log_repository';
import { APP_CONFIG } from '../../../config/app_config';

/**
 * Servicio de Aplicación para Logs de Hábitos
 */
export class HabitLogService {
  constructor(private readonly repository: HabitLogRepository) {}

  /**
   * Registrar o actualizar un log (Push por parte del cliente)
   */
  async pushLog(userId: string, data: PushHabitLogDTO): Promise<HabitLogModel> {
    const logId = `log_${data.habitId}_${data.date.replace(/-/g, '')}`;
    const now = new Date().toISOString();

    const log: HabitLogModel = {
      id: logId,
      habitId: data.habitId,
      userId,
      date: data.date,
      completed: data.completed,
      updatedAt: now,
    };

    await this.repository.save(userId, log);
    return log;
  }

  /**
   * Lógica para el Job de Limpieza Semanal (Domingos)
   * Elimina logs mayores a 15 días para optimizar costos y espacio.
   */
  async cleanupOldLogs(userId: string): Promise<number> {
    const limitDate = new Date();
    limitDate.setDate(limitDate.getDate() - APP_CONFIG.SYNC.MAX_LOG_HISTORY_DAYS);
    const limitDateStr = limitDate.toISOString().split('T')[0];

    console.log(`[CLEANUP]: Eliminando logs de usuario ${userId} anteriores a ${limitDateStr}`);
    return this.repository.deleteOlderThan(userId, limitDateStr);
  }
}
