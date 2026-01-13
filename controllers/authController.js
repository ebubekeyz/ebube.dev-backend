import User from '../models/User.js';
import { StatusCodes } from 'http-status-codes';
import BadRequestError from '../errors/badRequest.js';
import UnauthorizedError from '../errors/unauthorized.js';
import nodemailer from 'nodemailer';
import bcrypt from 'bcryptjs';

export const registerUser = async (req, res) => {
  let {
    id,
    email,
    lastName,
    firstName,
    phoneNumber,
    officeNumber,
    companyName,
    trackId,
    address,
    password,
    photo,
    role,
  } = req.body;

  const getRandomTwoDigit1 = () => {
    return Math.floor(Math.random() * 100);
  };

  let randomTwoDigit1 = getRandomTwoDigit1();

  const getRandomTwoDigit2 = () => {
    return Math.floor(Math.random() * 100);
  };

  let randomTwoDigit2 = getRandomTwoDigit2();

  const user = await User.create({
    id: `UZ-${randomTwoDigit1}`,
    email,
    lastName,
    firstName,
    phoneNumber,
    officeNumber,
    companyName,
    trackId: `SW-${randomTwoDigit1}-${randomTwoDigit2}`,
    address,
    password,
    photo,
    role,
  });
  const token = user.createJWT();
  res.status(StatusCodes.CREATED).json({ user: user, token: token });
};

export const loginUser = async (req, res) => {
  const { email, password } = req.body;
  if (!email) {
    throw new BadRequestError('Please provide an email');
  }
  if (!password) {
    throw new BadRequestError('Please provide a password');
  }
  const user = await User.findOne({ email });
  const isPasswordCorrect = await user.comparePassword(password);
  if (!isPasswordCorrect) {
    throw new UnauthorizedError('Password did not match');
  }

  const token = user.createJWT();

  res.status(StatusCodes.OK).json({ user: user, token: token });
};
export const getAllUsers = async (req, res) => {
  let {
    email,
    lastName,
    firstName,
    phoneNumber,
    officeNumber,
    companyName,
    address,
    user,
    sort,
    date,
  } = req.query;

  let result = User.find({});

  if (lastName) {
    result = User.find({ lastName: { $regex: lastName, $options: 'i' } });
  }

  if (firstName) {
    result = User.find({ firstName: { $regex: firstName, $options: 'i' } });
  }
  if (phoneNumber) {
    result = User.find({ phoneNumber: { $regex: phoneNumber, $options: 'i' } });
  }

  if (officeNumber) {
    result = User.find({
      officeNumber: { $regex: officeNumber, $options: 'i' },
    });
  }

  if (companyName) {
    result = User.find({
      companyName: { $regex: companyName, $options: 'i' },
    });
  }
  if (address) {
    result = User.find({
      address: { $regex: address, $options: 'i' },
    });
  }

  if (user) {
    result = User.find({
      user: { $regex: user, $options: 'i' },
    });
  }

  if (date) {
    result = Order.find({
      date: { $regex: date, $options: 'i' },
    });
  }

  if (email) {
    result = User.find({
      email: { $regex: email, $options: 'i' },
    });
  }

  if (sort === 'latest') {
    result = result.sort('-createdAt');
  }
  if (sort === 'oldest') {
    result = result.sort('createdAt');
  }
  if (sort === 'a-z') {
    result = result.sort('firstName');
  }
  if (sort === 'z-a') {
    result = result.sort('-firstName');
  }

  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  result = result.skip(skip).limit(limit);

  const users = await result;

  const totalUsers = await User.countDocuments();
  const numOfPage = Math.ceil(totalUsers / limit);

  res.status(StatusCodes.OK).json({
    users: users,
    meta: {
      pagination: { page: page, total: totalUsers, pageCount: numOfPage },
    },
  });
};

export const getSingleUser = async (req, res) => {
  const { id: userId } = req.params;
  const user = await User.findOne({ _id: userId });
  if (!user) {
    throw new BadRequestError(`User with id ${userId} does not exist`);
  }

  res.status(StatusCodes.OK).json({ user: user });
};

export const editSingleUser = async (req, res) => {
  const { id: userId } = req.params;
  const user = await User.findOneAndUpdate({ _id: userId }, req.body, {
    new: true,
    runValidators: true,
  });

  if (!user) {
    throw new BadRequestError(`User with id ${userId} does not exist`);
  }
  const token = user.createJWT();
  res.status(StatusCodes.OK).json({ user: user, token: token });
};

export const deleteSingleUser = async (req, res) => {
  const { id: userId } = req.params;
  const user = await User.findByIdAndDelete({ _id: userId });
  if (!user) {
    throw new BadRequestError(`User with id ${userId} does not exist`);
  }
  res.status(StatusCodes.OK).json({ msg: 'User Deleted' });
};

export const deleteAllUsers = async (req, res) => {
  const user = await User.deleteMany();
  res.status(StatusCodes.OK).json({ msg: 'Users Deleted' });
};

export const showCurrentUser = async (req, res) => {
  res.status(StatusCodes.OK).json({ user: req.user });
};

export const updateUserPassword = async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  if (!oldPassword || !newPassword) {
    throw new BadRequestError('Please provide both values');
  }

  const user = await User.findOne({ _id: req.user.userId });
  const isPasswordCorrect = await user.comparePassword(oldPassword);
  if (!isPasswordCorrect) {
    throw new UnauthorizedError('Password did not match existing user');
  }

  user.password = newPassword;

  await user.save();

  const token = user.createJWT();

  res.status(StatusCodes.OK).json({ user: user, token: token });
};

export const emailPassword = async (req, res) => {
  const { email } = req.body;

  const checkEmail = await User.findOne({ email });
  if (!checkEmail) {
    throw new BadRequestError('Email does not exist');
  }

  res.status(StatusCodes.OK).json({ user: checkEmail });
};

export const passwordReset = async (req, res) => {
  const { newPassword, password } = req.body;

  if (newPassword !== password) {
    throw new BadRequestError('Password did not match');
  }

  if (!newPassword || !password) {
    throw new BadRequestError('No field must be empty');
  }

  const { id: userId } = req.params;

  const salt = await bcrypt.genSalt(10);
  const hashPassword = await bcrypt.hash(password, salt);

  const user = await User.findOneAndUpdate(
    { _id: userId },
    { newPassword, password: hashPassword },
    { new: true, runValidators: true }
  );

  if (!user) {
    throw new UnauthorizedError(`No user with id ${userId} `);
  }

  const token = user.createJWT();

  res
    .status(StatusCodes.OK)
    .json({ user: user, token: token, msg: 'Password has been reset' });
};
