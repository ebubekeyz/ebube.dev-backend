import express from 'express';
const router = express.Router();

import auth from '../middleware/authentication.js';
import authPermission from '../middleware/authPermission.js';

import {
  createContact,
  getSingleContact,
  deleteSingleContact,
  deleteAllContact,
  deleteUserContact,
  editSingleContact,
  getContact,
  editUserContact,
} from '../controllers/ContactController.js';

router
  .route('/')
  .post(createContact)
  .delete(auth, authPermission('admin', 'owner'), deleteAllContact);

router.route('/allContact').get(getContact);

router
  .route('/:id')
  .get(getSingleContact)
  .delete(auth, authPermission('admin', 'owner'), deleteSingleContact)
  .patch(auth, editSingleContact);

router.route('/:id/deleteUserContact').delete(auth, deleteUserContact);
router.route('/:id/editUserContact').patch(auth, editUserContact);

export default router;
