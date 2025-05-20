import { Router } from 'express';
import {
  createFiling,
  getAllFilings,
  getFilingById,
} from '../controllers/filingController';

const router = Router();

router.post('/filings', createFiling);
router.get('/filings', getAllFilings);
router.get('/filings/:id', getFilingById);

export default router;
