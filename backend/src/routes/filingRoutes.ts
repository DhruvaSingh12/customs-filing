import express from 'express';
import { createFiling, getAllFilings, getFilingById, updateFiling, deleteFiling } from '../controllers/filingController';

const router = express.Router();

router.get('/', getAllFilings);
router.get('/:id', getFilingById);
router.post('/', createFiling);
router.put('/:id', updateFiling);
router.delete('/:id', deleteFiling);

export default router;
