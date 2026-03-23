import { SyncRequestDTO, SyncResponseDTO } from '../domain/sync_models';
import { HabitRepository } from '../../habits/infrastructure/habit_repository';
import { HabitLogRepository } from '../../habits/infrastructure/habit_log_repository';
import { HabitModel } from '../../habits/domain/habit_model';
import { HabitLogModel } from '../../habits/domain/habit_log_model';

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
    const { lastSyncTimestamp, habits, logs } = request;
    const serverTimestamp = new Date().toISOString();

    // 1. PUSH: Procesar cambios que vienen del Cliente
    // Para simplificar, usamos el repositorio para guardar (el repo ya hace merge: true)
    // En una App Pro, validaríamos el updatedAt para evitar sobreescribir datos más nuevos en el servidor
    for (const remoteHabit of habits) {
      const localHabit = await this.habitRepo.findById(userId, remoteHabit.id);
      if (!localHabit || new Date(remoteHabit.updatedAt) > new Date(localHabit.updatedAt)) {
        await this.habitRepo.save(userId, remoteHabit);
      }
    }

    for (const remoteLog of logs) {
      // Los logs usualmente son deterministas por fecha, pero igual usamos el save con merge
      await this.logRepo.save(userId, remoteLog);
    }

    // 2. PULL: Obtener cambios desde el Servidor para el Cliente
    // Buscamos todo lo que se actualizó después de la última sincronización del cliente
    const habitsToPull = await this.habitRepo.findChangesSince(userId, lastSyncTimestamp);
    const logsToPull = await this.logRepo.findChangesSince(userId, lastSyncTimestamp);

    return {
      serverTimestamp,
      habits: habitsToPull,
      logs: logsToPull,
    };
  }
}
