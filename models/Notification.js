import mongoose from 'mongoose';
import moment from 'moment';
import validator from 'validator';

const NotificationSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: [true, 'Please enter email'],
      validate: {
        validator: validator.isEmail,
        message: 'Please provide a valid email',
      },
    },
    status: {
      type: String,
      enum: ['pending', 'sent'],
      default: 'pending',
    },

    date: {
      type: String,
      default: moment().format('YYYY-DD-MM'),
    },
  },
  { timestamps: true }
);

export default mongoose.model('Notification', NotificationSchema);
