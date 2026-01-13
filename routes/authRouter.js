import express from 'express';
const router = express.Router();

import auth from '../middleware/authentication.js';
import authPermission from '../middleware/authPermission.js';

import {
  registerUser,
  loginUser,
  getAllUsers,
  getSingleUser,
  editSingleUser,
  deleteSingleUser,
  deleteAllUsers,
  showCurrentUser,
  updateUserPassword,
  passwordReset,
  emailPassword,
} from '../controllers/authController.js';

router
  .route('/')
  .get(getAllUsers)
  .delete(auth, authPermission('admin', 'owner'), deleteAllUsers);
router.route('/local/register').post(registerUser);
router.route('/local').post(loginUser);
router.route('/showMe').get(auth, showCurrentUser);
router.route('/updatePassword').patch(auth, updateUserPassword);
router.route('/emailPassword').post(emailPassword);
router
  .route('/:id')
  .patch(auth, editSingleUser)
  .delete(auth, authPermission('admin', 'owner'), deleteSingleUser)
  .get(auth, getSingleUser);

router.route('/:id/passwordReset').patch(passwordReset);

export default router;
