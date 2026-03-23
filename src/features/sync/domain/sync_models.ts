import { HabitModel } from '../../habits/domain/habit_model';
import { HabitLogModel } from '../../habits/domain/habit_log_model';

/**
 * Payload de solicitud de sincronización (Mobile -> Cloud)
 */
export interface SyncRequestDTO {
  lastSyncTimestamp: string; // ISO String
  habits: HabitModel[];
  logs: HabitLogModel[];
}

/**
 * Respuesta de sincronización (Cloud -> Mobile)
 */
export interface SyncResponseDTO {
  serverTimestamp: string;
  habits: HabitModel[];
  logs: HabitLogModel[];
  deletedIds?: {
    habits: string[];
    logs: string[];
  };
}
