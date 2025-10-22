import { Router } from 'express';
import { z } from 'zod';
import { validateQuery } from '../middlewares/validate';

const router = Router();