import express from 'express';
import Chat from '../models/Chat.js';

const router = express.Router();

router.post('/:projectId', async (req, res) => {
  const { projectId } = req.params;
  const { sender, content, isAI } = req.body;

  try {
    let chat = await Chat.findOne({ projectId });

    if (!chat) {
      chat = new Chat({ projectId, messages: [] });
    }

    chat.messages.push({ sender, content, isAI });
    await chat.save();

    res.status(200).json(chat);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:projectId', async (req, res) => {
  const { projectId } = req.params;

  try {
    const chat = await Chat.findOne({ projectId });
    res.status(200).json(chat?.messages || []);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
