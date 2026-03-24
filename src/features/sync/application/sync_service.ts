import { SyncRequestDTO, SyncResponseDTO } from '../domain/sync_models';
import { HabitRepository } from '../../habits/infrastructure/habit_repository';
import { HabitLogRepository } from '../../habits/infrastructure/habit_log_repository';

/**
 * Servicio Engine de Sincronización
 */
export class SyncService {
  constructor(
    private readonly habitRepo: HabitRepository,
    private readonly logRepo: HabitLogRepository
  ) {}

  /**
   * Procesa una solicitud de sincronización completa
   */
  async processSync(userId: string, request: SyncRequestDTO): Promise<SyncResponseDTO> {
    const { lastSyncTimestamp, habits = [], logs = [] } = request;
    const serverTimestamp = new Date().toISOString();

    // 1. PUSH: Procesar cambios que vienen del Cliente
    for (const remoteHabit of habits) {
      const habitToSave = {
        ...remoteHabit,
        userId: userId,
        createdAt: remoteHabit.createdAt || remoteHabit.updatedAt || serverTimestamp,
        updatedAt: remoteHabit.updatedAt || serverTimestamp,
      };
      const localHabit = await this.habitRepo.findById(userId, remoteHabit.id);
      const remoteDate = new Date(habitToSave.updatedAt);
      const localDate = localHabit ? new Date(localHabit.updatedAt) : new Date(0);
      if (!localHabit || remoteDate >= localDate) {
        await this.habitRepo.save(userId, habitToSave);
      }
    }

    for (const remoteLog of logs) {
      const logToSave = {
        ...remoteLog,
        userId: userId,
        createdAt: remoteLog.createdAt || remoteLog.updatedAt || serverTimestamp,
        updatedAt: remoteLog.updatedAt || serverTimestamp,
      };
      await this.logRepo.save(userId, logToSave);
    }

    // 2. PULL: Obtener cambios desde el Servidor para el Cliente
    // Si lastSyncTimestamp es la época (primer login), traer TODO
    let habitsToPull;
    let logsToPull;

    const isFirstSync =
      !lastSyncTimestamp ||
      lastSyncTimestamp === '1970-01-01T00:00:00Z' ||
      lastSyncTimestamp === '1970-01-01T00:00:00.000Z';

    if (isFirstSync) {
      // Primera sincronización: traer todos los datos del usuario sin filtro de fecha
      console.log(`[SyncService] Primera sincronización detectada para userId: ${userId}. Trayendo todos los datos.`);
      habitsToPull = await this.habitRepo.findAll(userId);
      logsToPull = await this.logRepo.findAll(userId);
    } else {
      // Sincronización incremental: solo traer cambios nuevos
      console.log(`[SyncService] Sincronización incremental desde: ${lastSyncTimestamp}`);
      habitsToPull = await this.habitRepo.findChangesSince(userId, lastSyncTimestamp);
      logsToPull = await this.logRepo.findChangesSince(userId, lastSyncTimestamp);
    }

    return {
      serverTimestamp,
      habits: habitsToPull,
      logs: logsToPull,
    };
  }
}
