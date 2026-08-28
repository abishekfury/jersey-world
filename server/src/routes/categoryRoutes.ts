import { Router } from 'express';
import { getMetadata, getTeams, getCountries } from '../controllers/categoryController';

const router = Router();

router.get('/meta', getMetadata);
router.get('/teams', getTeams);
router.get('/countries', getCountries);

export default router;
