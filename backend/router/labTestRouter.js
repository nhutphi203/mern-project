import express from 'express';
import { labTestController } from '../controller/labTestController.js';

const labTestRouter = express.Router();

// API Endpoint để lấy tất cả các xét nghiệm
labTestRouter.get('/all', labTestController.getAllLabTests);

export default labTestRouter;