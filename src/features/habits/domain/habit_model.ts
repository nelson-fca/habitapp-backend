/**
 * Interfaz de Dominio para un Hábito
 * Coincide con el modelo Isar en Flutter y swagger.json
 */
export interface HabitModel {
  id: string;
  userId: string;
  title: string;
  description: string;
  frequency: number[]; // 1-7
  color: string;
  createdAt: string; // ISO String
  updatedAt: string; // ISO String
  isArchived: boolean;
  isDeleted?: boolean; // Para sincronización "soft delete"
}

/**
 * DTO para creación de hábitos
 */
export interface CreateHabitDTO {
  title: string;
  description?: string;
  frequency: number[];
  color?: string;
}

/**
 * DTO para actualización de hábitos
 */
export interface UpdateHabitDTO {
  title?: string;
  description?: string;
  frequency?: number[];
  color?: string;
  isArchived?: boolean;
}
