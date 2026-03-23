import { HabitModel, CreateHabitDTO, UpdateHabitDTO } from '../domain/habit_model';
import { HabitRepository } from '../infrastructure/habit_repository';
import { AppError, ErrorCode } from '../../../core/errors/app_error';

/**
 * Servicio de Aplicación para Hábitos
 * Implementa la lógica de negocio y orquestación.
 */
export class HabitService {
  constructor(private readonly repository: HabitRepository) {}

  /**
   * Obtener todos los hábitos activos
   */
  async getAllHabits(userId: string): Promise<HabitModel[]> {
    return this.repository.findAll(userId);
  }

  /**
   * Crear un nuevo hábito
   */
  async createHabit(userId: string, data: CreateHabitDTO): Promise<HabitModel> {
    const now = new Date().toISOString();
    
    // Generar ID único (En un entorno Real usaríamos crypto o UUID)
    const habitId = `h_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;

    const newHabit: HabitModel = {
      id: habitId,
      userId,
      title: data.title,
      description: data.description || '',
      frequency: data.frequency,
      color: data.color || '#A8E6CF',
      createdAt: now,
      updatedAt: now,
      isArchived: false,
    };

    await this.repository.save(userId, newHabit);
    return newHabit;
  }

  /**
   * Actualizar un hábito existente
   */
  async updateHabit(userId: string, habitId: string, data: UpdateHabitDTO): Promise<HabitModel> {
    const existing = await this.repository.findById(userId, habitId);
    if (!existing) {
      throw new AppError(ErrorCode.NOT_FOUND, 'El hábito solicitado no existe.', 404);
    }

    const updatedHabit: HabitModel = {
      ...existing,
      ...data,
      updatedAt: new Date().toISOString(),
    };

    await this.repository.save(userId, updatedHabit);
    return updatedHabit;
  }

  /**
   * Eliminación lógica (Soft Delete) para sincronización
   */
  async deleteHabit(userId: string, habitId: string): Promise<void> {
    const existing = await this.repository.findById(userId, habitId);
    if (!existing) return;

    const deletedHabit: HabitModel = {
      ...existing,
      isDeleted: true,
      updatedAt: new Date().toISOString(),
    };

    await this.repository.save(userId, deletedHabit);
  }
}
