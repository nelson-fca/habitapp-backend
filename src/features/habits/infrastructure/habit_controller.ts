import { Response, NextFunction, Router } from 'express';
import { AuthenticatedRequest, authMiddleware } from '../../../core/middlewares/auth_middleware';
import { HabitService } from '../application/habit_service';
import { HabitRepository } from '../infrastructure/habit_repository';

const router = Router();
const service = new HabitService(new HabitRepository());

/**
 * [GET] /v1/habits - Listar todos los hábitos del usuario
 */
router.get('/', authMiddleware, async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.uid;
    const habits = await service.getAllHabits(userId);
    return res.status(200).json(habits);
  } catch (error) {
    return next(error);
  }
});

/**
 * [POST] /v1/habits - Crear un nuevo hábito
 */
router.post('/', authMiddleware, async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.uid;
    const newHabit = await service.createHabit(userId, req.body);
    return res.status(201).json(newHabit);
  } catch (error) {
    return next(error);
  }
});

/**
 * [PATCH] /v1/habits/:id - Actualizar un hábito
 */
router.patch('/:id', authMiddleware, async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.uid;
    const habitId = req.params.id;
    const updated = await service.updateHabit(userId, habitId, req.body);
    return res.status(200).json(updated);
  } catch (error) {
    return next(error);
  }
});

/**
 * [DELETE] /v1/habits/:id - Eliminar un hábito (Soft Delete)
 */
router.delete('/:id', authMiddleware, async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.uid;
    const habitId = req.params.id;
    await service.deleteHabit(userId, habitId);
    return res.status(204).send();
  } catch (error) {
    return next(error);
  }
});

export const habitsRouter = router;
