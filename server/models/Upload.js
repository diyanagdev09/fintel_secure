import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema({
  transactionIndex: { type: Number, required: true },
  status: { type: String, enum: ['safe', 'fraud'], required: true },
  note: { type: String, trim: true, maxlength: 500, default: '' },
  reviewedAt: { type: Date, default: Date.now },
  reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { _id: false });

const schema = new mongoose.Schema({
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  filename: { type: String, required: true, trim: true },
  integrityHash: { type: String, required: true, index: true },
  size: { type: Number, required: true },
  sequentialTime: { type: Number, required: true, min: 0 },
  parallelTime: { type: Number, required: true, min: 0 },
  headers: [{ type: String }],
  rows: { type: [mongoose.Schema.Types.Mixed], required: true },
  riskReviews: { type: [reviewSchema], default: [] },
}, { timestamps: true });

export default mongoose.model('Upload', schema);
