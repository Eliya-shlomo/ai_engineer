import express from 'express';
import { generateReport } from '../controllers/reportController';

const router = express.Router();

router.post('/generate', generateReport);

export default router;
