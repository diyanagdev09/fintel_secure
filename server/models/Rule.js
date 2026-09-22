import mongoose from 'mongoose';

const schema = new mongoose.Schema({
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  name: { type: String, required: true, trim: true, maxlength: 100 },
  description: { type: String, trim: true, maxlength: 300, default: '' },
  field: { type: String, required: true, trim: true },
  operator: { type: String, enum: ['gt', 'gte', 'lt', 'lte', 'eq', 'neq', 'contains'], required: true },
  value: { type: mongoose.Schema.Types.Mixed, required: true },
  action: { type: String, enum: ['flag', 'high', 'medium'], default: 'flag' },
  enabled: { type: Boolean, default: false },
}, { timestamps: true });

export default mongoose.model('Rule', schema);
