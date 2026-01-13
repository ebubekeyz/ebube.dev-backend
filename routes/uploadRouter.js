import express from 'express';
const router = express.Router();

import upload from '../controllers/uploadImageController.js';

router.route('/').post(upload);

export default router;
