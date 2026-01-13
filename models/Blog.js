import mongoose from 'mongoose';
import moment from 'moment';
import validator from 'validator';

const BlogSchema = new mongoose.Schema(
  {
    featured: {
      type: Boolean,
      enum: [true, false],
      default: false,
    },
    category: {
      type: String,
      enum: ['Industry Trends', 'Warehousing', 'Transportation'],
    },
    topic: {
      type: String,
    },
    shippingMode: {
      type: String,
      enum: [
        'Air Transport',
        'Surface Transport (Road, Rail, Sea)',
        'Multimodal Transport',
      ],
      required: true,
    },

    cargoName: {
      type: String,
    },
    weight: {
      type: String,
    },
    packaging: {
      type: String,
      enum: ['Bales', 'Bundles', 'Cartons', 'Cases', 'Drums'],
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    quantity: {
      type: String,
    },
    typeOfCargo: {
      type: String,
      enum: [
        'Not perishable and not dangerous products',
        'Perishable',
        'Hazardous',
        'Others',
      ],
      required: true,
    },
    insuranceRequired: {
      type: String,
      enum: ['No', 'Yes'],
      required: true,
    },
    departureLocation: {
      type: String,
    },
    deliveryLocation: {
      type: String,
    },
    pickupDate: {
      type: String,
    },
    details: {
      type: String,
    },
    status: {
      type: String,
      enum: ['delivered', 'shipping', 'pending', 'cancel'],
      default: 'pending',
    },

    date: {
      type: String,
      default: moment().format('YYYY-DD-MM'),
    },
    user: {
      type: mongoose.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model('Blog', BlogSchema);
