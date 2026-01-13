import express from 'express';
const router = express.Router();

import auth from '../middleware/authentication.js';
import authPermission from '../middleware/authPermission.js';

import {
  createNotification,
  getSingleNotification,
  deleteSingleNotification,
  deleteAllNotifications,
  deleteUserNotification,
  editSingleNotification,
  getNotifications,
  editUserNotification,
} from '../controllers/notificationController.js';

router
  .route('/')
  .post(createNotification)
  .delete(auth, authPermission('admin', 'owner'), deleteAllNotifications);

router.route('/allNotification').get(getNotifications);

router
  .route('/:id')
  .get(getSingleNotification)
  .delete(auth, authPermission('admin', 'owner'), deleteSingleNotification)
  .patch(auth, editSingleNotification);

router
  .route('/:id/deleteUserNotification')
  .delete(auth, deleteUserNotification);
router.route('/:id/editUserNotification').patch(auth, editUserNotification);

export default router;
