import mongoose from 'mongoose';

const aiInteractionSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  prompt: { type: String, required: true },
  response: { type: String, required: true },
  type: { type: String, default: 'chat' }, // or 'code-review'
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('AiInteraction', aiInteractionSchema);
