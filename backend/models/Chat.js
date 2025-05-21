// models/Chat.js
import mongoose from 'mongoose'

const messageSchema = new mongoose.Schema({
  sender: String, // e.g., user email
  content: String,
  isAI: Boolean,
  createdAt: {
    type: Date,
    default: Date.now
  }
})

const chatSchema = new mongoose.Schema({
  projectId: mongoose.Schema.Types.ObjectId, // Link to project if needed
  messages: [messageSchema]
})

export default mongoose.model('Chat', chatSchema)
