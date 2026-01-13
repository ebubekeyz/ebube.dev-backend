import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import moment from 'moment';
import validator from 'validator';

const UserSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: [true, 'Please enter email'],
      validate: {
        validator: validator.isEmail,
        message: 'Please provide a valid email',
      },
      unique: true,
    },
    id: {
      type: String,
    },
    photo: {
      type: String,
      default: '/uploads/avatar.png',
    },

    firstName: {
      type: String,
      required: true,
      minlength: [3, 'Name is too short'],
    },
    lastName: {
      type: String,
      required: true,
      minlength: [3, 'Name is too short'],
    },

    password: {
      type: String,
      required: true,
    },
    trackId: {
      type: String,
    },

    phoneNumber: {
      type: String,
      default: 'XXX-XXX-XXX',
    },
    companyName: {
      type: String,
      default: 'Company Name',
    },
    officeNumber: {
      type: String,
      default: 'XXX-XXX-XXX',
    },
    address: {
      type: String,
      default: 'Address',
    },

    role: {
      type: String,
      enum: ['admin', 'owner', 'user'],
      default: 'user',
    },
    date: {
      type: String,
      default: moment().format('YYYY-DD-MM'),
    },
  },
  { timestamps: true }
);
// test
UserSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

UserSchema.methods.createJWT = function () {
  return jwt.sign(
    {
      userId: this._id,
      id: this.id,
      firstName: this.firstName,
      lastName: this.lastName,
      phoneNumber: this.phoneNumber,
      officeNumber: this.officeNumber,
      companyName: this.companyName,
      address: this.address,
      email: this.email,
      trackId: this.trackId,
      role: this.role,
      photo: this.photo,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_LIFETIME,
    }
  );
};

UserSchema.methods.comparePassword = async function (candidatePassword) {
  const isWait = await bcrypt.compare(candidatePassword, this.password);
  return isWait;
};

export default mongoose.model('User', UserSchema);
