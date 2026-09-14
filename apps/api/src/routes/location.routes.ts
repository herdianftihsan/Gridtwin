import { Router } from 'express';
import { locationController } from '../controllers/location.controller.js';

export const locationRouter = Router();

locationRouter.get('/search', locationController.search);
