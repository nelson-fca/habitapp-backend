import { Response, NextFunction, Router } from 'express';
import { AuthenticatedRequest, authMiddleware } from '../../../core/middlewares/auth_middleware';
import { HabitLogService } from '../application/habit_log_service';
import { HabitLogRepository } from '../infrastructure/habit_log_repository';

const router = Router();
const service = new HabitLogService(new HabitLogRepository());

/**
 * [POST] /v1/habits/logs - Registrar cumplimiento de un hábito
 */
router.post('/', authMiddleware, async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.uid;
    const log = await service.pushLog(userId, req.body);
    return res.status(200).json(log);
  } catch (error) {
    return next(error);
  }
});

export const logsRouter = router;
