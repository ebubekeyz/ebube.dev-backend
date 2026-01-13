import mongoose from 'mongoose';
import moment from 'moment';
import validator from 'validator';

const ContactSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    subject: {
      type: String,
    },
    phone: {
      type: String,
    },
    message: {
      type: String,
    },

    status: {
      type: String,
      enum: ['sent', 'not sent'],
      default: 'not sent',
    },

    date: {
      type: String,
      default: moment().format('YYYY-DD-MM'),
    },
  },
  { timestamps: true }
);

export default mongoose.model('Contact', ContactSchema);
