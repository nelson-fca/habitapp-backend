/**
 * Interfaz de Dominio para el Registro de un Hábito (Log)
 */
export interface HabitLogModel {
  id: string;
  habitId: string;
  userId: string;
  date: string; // ISO String o YYYY-MM-DD
  completed: boolean;
  createdAt?: string;
  updatedAt: string;
  isDeleted?: boolean; // Para sincronización
}

/**
 * DTO para creación/actualización de logs (Push por día)
 */
export interface PushHabitLogDTO {
  habitId: string;
  date: string;
  completed: boolean;
}
