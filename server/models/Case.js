import mongoose from 'mongoose';

const timelineSchema = new mongoose.Schema({
  type: { type: String, trim: true, maxlength: 40, required: true },
  text: { type: String, trim: true, maxlength: 500, required: true },
  actor: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  at: { type: Date, default: Date.now },
}, { _id: false });

const transactionRefSchema = new mongoose.Schema({
  uploadId: { type: mongoose.Schema.Types.ObjectId, ref: 'Upload', required: true },
  transactionIndex: { type: Number, required: true },
  riskScore: Number,
  anomalyScore: Number,
}, { _id: false });

const schema = new mongoose.Schema({
  caseNumber: { type: String, unique: true, index: true },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  title: { type: String, required: true, trim: true, maxlength: 160 },
  priority: { type: String, enum: ['low', 'medium', 'high', 'critical'], default: 'medium' },
  status: { type: String, enum: ['open', 'investigating', 'escalated', 'resolved'], default: 'open' },
  assignedTo: { type: String, trim: true, maxlength: 120, default: '' },
  transactions: { type: [transactionRefSchema], default: [] },
  notes: { type: String, trim: true, maxlength: 5000, default: '' },
  timeline: { type: [timelineSchema], default: [] },
  evidence: [{
    label: String,
    value: String,
  }],
}, { timestamps: true });

schema.pre('save', function(next) {
  if (!this.caseNumber) {
    this.caseNumber = `FS-${new Date().getFullYear()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
  }
  next();
});

export default mongoose.model('Case', schema);
