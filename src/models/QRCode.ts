import mongoose, { Schema, Document } from 'mongoose';

export interface IQRCode extends Document {
  code: string;
  qrImage: string;
  isAssigned: boolean;
  objectDetails?: {
    title: string;
    phoneNumber: string;
    location: string;
    notes: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

const QRCodeSchema = new Schema<IQRCode>({
  code: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  qrImage: {
    type: String,
    required: true,
  },
  isAssigned: {
    type: Boolean,
    default: false,
  },
  objectDetails: {
    title: String,
    phoneNumber: String,
    location: String,
    notes: String,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
}, {
  timestamps: true,
  versionKey: false,
});

// Create indexes
QRCodeSchema.index({ code: 1 }, { unique: true });
QRCodeSchema.index({ isAssigned: 1 });
QRCodeSchema.index({ createdAt: -1 });

// Handle duplicate key errors
QRCodeSchema.post('save', function(error: any, doc: any, next: any) {
  if (error.name === 'MongoError' && error.code === 11000) {
    next(new Error('A QR code with this identifier already exists'));
  } else {
    next(error);
  }
});

// Check if model exists before creating
const QRCode = mongoose.models.QRCode || mongoose.model<IQRCode>('QRCode', QRCodeSchema);

export default QRCode;
