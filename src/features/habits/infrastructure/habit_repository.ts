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

  /**
   * Obtiene todos los hábitos de un usuario
   */
  async findAll(userId: string): Promise<HabitModel[]> {
    const snapshot = await this.getCollection(userId).where('isDeleted', '!=', true).get();
    return snapshot.docs.map((doc) => doc.data() as HabitModel);
  }

  /**
   * Obtiene cambios desde una fecha específica (Para Sync)
   */
  async findChangesSince(userId: string, lastSync: string): Promise<HabitModel[]> {
    const snapshot = await this.getCollection(userId)
      .where('updatedAt', '>', lastSync)
      .get();
    return snapshot.docs.map((doc) => doc.data() as HabitModel);
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
    return doc.exists ? (doc.data() as HabitModel) : null;
  }
}
