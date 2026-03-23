import { Response, NextFunction, Router } from 'express';
import { AuthenticatedRequest, authMiddleware } from '../../../core/middlewares/auth_middleware';
import { SyncService } from '../application/sync_service';
import { HabitRepository } from '../../habits/infrastructure/habit_repository';
import { HabitLogRepository } from '../../habits/infrastructure/habit_log_repository';

const router = Router();
const service = new SyncService(
  new HabitRepository(), 
  new HabitLogRepository()
);

/**
 * [POST] /v1/sync - Sincronización Masiva
 */
router.post('/', authMiddleware, async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.uid;
    const syncData = await service.processSync(userId, req.body);
    return res.status(200).json(syncData);
  } catch (error) {
    return next(error);
  }
});

export const syncRouter = router;
