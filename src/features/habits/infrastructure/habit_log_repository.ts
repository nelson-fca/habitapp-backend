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

  /**
   * Obtiene todos los logs de un usuario (Para primera sincronización)
   */
  async findAll(userId: string): Promise<HabitLogModel[]> {
    const snapshot = await this.getCollection(userId).get();
    return snapshot.docs.map((doc) => doc.data() as HabitLogModel);
  }

  /**
   * Registra o actualiza un log
   */
  async save(userId: string, log: HabitLogModel): Promise<void> {
    await this.getCollection(userId).doc(log.id).set(log, { merge: true });
  }

  /**
   * Obtiene cambios desde una fecha específica (Para Sync)
   */
  async findChangesSince(userId: string, lastSync: string): Promise<HabitLogModel[]> {
    const snapshot = await this.getCollection(userId)
      .where('updatedAt', '>', lastSync)
      .get();
    return snapshot.docs.map((doc) => doc.data() as HabitLogModel);
  }

  /**
   * Elimina logs anteriores a una fecha específica (Para el Job de limpieza)
   */
  async deleteOlderThan(userId: string, dateLimit: string): Promise<number> {
    const snapshot = await this.getCollection(userId)
      .where('date', '<', dateLimit)
      .get();
    
    // Batch delete para eficiencia y costo
    const batch = admin.firestore().batch();
    snapshot.docs.forEach((doc) => batch.delete(doc.ref));
    await batch.commit();
    
    return snapshot.size;
  }
}
