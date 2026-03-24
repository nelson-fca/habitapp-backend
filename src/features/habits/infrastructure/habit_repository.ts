import * as admin from 'firebase-admin';
import { APP_CONFIG } from '../../../config/app_config';
import { HabitModel } from '../domain/habit_model';

/**
 * Repositorio de Hábitos con Cloud Firestore
 */
export class HabitRepository {
  private getCollection(userId: string) {
    return admin
      .firestore()
      .collection(APP_CONFIG.COLLECTIONS.USERS)
      .doc(userId)
      .collection(APP_CONFIG.COLLECTIONS.HABITS);
  }

  /** Enriquece un documento con campos obligatorios usando el userId del path */
  private enrich(userId: string, data: FirebaseFirestore.DocumentData): HabitModel {
    const now = new Date().toISOString();
    return {
      id: data.id,
      userId: userId,                              // Siempre usar el UID real del path
      title: data.title || 'Sin título',
      description: data.description || '',
      frequency: Array.isArray(data.frequency) && data.frequency.length > 0
        ? data.frequency
        : [1, 2, 3, 4, 5],                        // Lunes a Viernes por defecto
      color: data.color || '#A8E6CF',
      createdAt: data.createdAt || data.updatedAt || now,
      updatedAt: data.updatedAt || now,
      isArchived: data.isArchived === true,
      isDeleted: data.isDeleted === true,
    };
  }

  /**
   * Obtiene todos los hábitos de un usuario (no borrados)
   */
  async findAll(userId: string): Promise<HabitModel[]> {
    const snapshot = await this.getCollection(userId).get();
    return snapshot.docs
      .map((doc) => this.enrich(userId, doc.data()))
      .filter((h) => !h.isDeleted);
  }

  /**
   * Obtiene cambios desde una fecha específica (Para Sync incremental)
   */
  async findChangesSince(userId: string, lastSync: string): Promise<HabitModel[]> {
    const snapshot = await this.getCollection(userId)
      .where('updatedAt', '>', lastSync)
      .get();
    return snapshot.docs.map((doc) => this.enrich(userId, doc.data()));
  }

  /**
   * Guarda o actualiza un hábito
   */
  async save(userId: string, habit: HabitModel): Promise<void> {
    await this.getCollection(userId).doc(habit.id).set(habit, { merge: true });
  }

  /**
   * Obtiene un hábito por ID
   */
  async findById(userId: string, habitId: string): Promise<HabitModel | null> {
    const doc = await this.getCollection(userId).doc(habitId).get();
    return doc.exists ? this.enrich(userId, doc.data()!) : null;
  }
}
