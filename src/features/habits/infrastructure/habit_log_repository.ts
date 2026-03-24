import * as admin from 'firebase-admin';
import { APP_CONFIG } from '../../../config/app_config';
import { HabitLogModel } from '../domain/habit_log_model';

/**
 * Repositorio de Logs de Hábitos en Cloud Firestore
 */
export class HabitLogRepository {
  private getCollection(userId: string) {
    return admin
      .firestore()
      .collection(APP_CONFIG.COLLECTIONS.USERS)
      .doc(userId)
      .collection(APP_CONFIG.COLLECTIONS.LOGS);
  }

  /** Enriquece un documento de log con campos obligatorios */
  private enrich(userId: string, data: FirebaseFirestore.DocumentData): HabitLogModel {
    const now = new Date().toISOString();
    return {
      id: data.id,
      habitId: data.habitId || '',
      userId: userId,            // Siempre usar el UID real del path
      date: data.date || now.split('T')[0],
      completed: data.completed === true,
      createdAt: data.createdAt || data.updatedAt || now,
      updatedAt: data.updatedAt || now,
    };
  }

  /**
   * Obtiene todos los logs de un usuario (Para primera sincronización)
   */
  async findAll(userId: string): Promise<HabitLogModel[]> {
    const snapshot = await this.getCollection(userId).get();
    return snapshot.docs.map((doc) => this.enrich(userId, doc.data()));
  }

  /**
   * Registra o actualiza un log
   */
  async save(userId: string, log: HabitLogModel): Promise<void> {
    await this.getCollection(userId).doc(log.id).set(log, { merge: true });
  }

  /**
   * Obtiene cambios desde una fecha específica (Para Sync incremental)
   */
  async findChangesSince(userId: string, lastSync: string): Promise<HabitLogModel[]> {
    const snapshot = await this.getCollection(userId)
      .where('updatedAt', '>', lastSync)
      .get();
    return snapshot.docs.map((doc) => this.enrich(userId, doc.data()));
  }

  /**
   * Elimina logs anteriores a una fecha específica (Para el Job de limpieza)
   */
  async deleteOlderThan(userId: string, dateLimit: string): Promise<number> {
    const snapshot = await this.getCollection(userId)
      .where('date', '<', dateLimit)
      .get();
    const batch = admin.firestore().batch();
    snapshot.docs.forEach((doc) => batch.delete(doc.ref));
    await batch.commit();
    return snapshot.size;
  }
}
