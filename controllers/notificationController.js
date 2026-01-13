import Notification from '../models/Notification.js';
import { StatusCodes } from 'http-status-codes';
import BadRequestError from '../errors/badRequest.js';
import UnauthorizedError from '../errors/unauthorized.js';

export const createNotification = async (req, res) => {
  const { email } = req.body;
  const exist = await Notification.findOne({ email });
  if (exist) {
    throw new BadRequestError('Email already exist');
  }
  const notification = await Notification.create(req.body);
  res.status(StatusCodes.CREATED).json({ attributes: notification });
};

export const getNotifications = async (req, res) => {
  let { email, date, sort } = req.query;

  let result = Notification.find({});

  if (email) {
    result = Notification.find({
      email: { $eq: email },
    });
  }

  if (sort === 'latest') {
    result = result.sort('-createdAt');
  }
  if (sort === 'oldest') {
    result = result.sort('createdAt');
  }

  if (sort === 'a-z') {
    result = result.sort('name');
  }
  if (sort === 'z-a') {
    result = result.sort('-name');
  }

  if (date) {
    result = Notification.find({
      date: { $regex: date, $options: 'i' },
    });
  }

  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  result = result.skip(skip).limit(limit);

  const notification = await result;

  const totalNotification = await Notification.countDocuments();
  const numOfPage = Math.ceil(totalNotification / limit);

  res.status(StatusCodes.OK).json({
    notification: notification,
    meta: {
      pagination: {
        page: page,
        total: totalNotification,
        pageCount: numOfPage,
      },
    },
  });
};

export const getSingleNotification = async (req, res) => {
  const { id: notificationId } = req.params;
  const notification = await Notification.findOne({ _id: notificationId });
  if (!notification) {
    throw new BadRequestError(
      `Notification with id ${notificationId} does not exist`
    );
  }

  res.status(StatusCodes.OK).json({ notification: notification });
};

export const editSingleNotification = async (req, res) => {
  const { id: notificationId } = req.params;
  const notification = await Notification.findOneAndUpdate(
    { _id: notificationId },
    req.body,
    {
      new: true,
      runValidators: true,
    }
  );

  if (!notification) {
    throw new BadRequestError(
      `Notification with id ${notificationId} does not exist`
    );
  }
  res.status(StatusCodes.OK).json({ notification: notification });
};

export const editUserNotification = async (req, res) => {
  const { id: userId } = req.params;
  const notification = await Notification.updateMany(
    { user: userId },
    req.body
  );

  res.status(StatusCodes.OK).json({ notification: notification });
};

export const deleteSingleNotification = async (req, res) => {
  const { id: notificationId } = req.params;
  const notification = await Notification.findByIdAndDelete({
    _id: notificationId,
  });
  if (!notification) {
    throw new BadRequestError(
      `Notification with id ${notificationId} does not exist`
    );
  }
  res.status(StatusCodes.OK).json({ msg: 'Notification Deleted' });
};

export const deleteAllNotifications = async (req, res) => {
  const notification = await Notification.deleteMany();
  res.status(StatusCodes.OK).json({ msg: 'Notification Deleted' });
};

export const deleteUserNotification = async (req, res) => {
  const { id: userId } = req.params;
  const notification = await Notification.deleteMany({ user: userId });

  res.status(StatusCodes.OK).json({ msg: 'Notification successfully deleted' });
};

// module.exports = {
//   getNotifications,
//   createNotification,
//   deleteUserNotification,
//   getAllNotifications,
//   getSingleNotification,
//   editSingleNotification,
//   deleteSingleNotification,
//   deleteAllNotifications,
//   editUserNotification,
// };
