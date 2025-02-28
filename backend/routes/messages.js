import express from 'express';
import pool from '../config/db.js';
import { authenticateToken } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/:receiverId', authenticateToken, async (req, res) => {
  try {
    const senderId = Number(req.user.id);
    const recId = Number(req.params.receiverId);
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;

    console.log(`Fetching messages between senderId: ${senderId} and receiverId: ${recId}`);

    const query = `
      SELECT * FROM messages 
      WHERE (sender_id = ? AND receiver_id = ?)
         OR (sender_id = ? AND receiver_id = ?)
      ORDER BY created_at ASC
      LIMIT ${limit} OFFSET ${offset}
    `;

    const [rows] = await pool.execute(query, [senderId, recId, recId, senderId]);
    res.json({ page, limit, messages: rows });
  } catch (err) {
    console.error('Error fetching messages:', err);
    res.status(500).json({ error: 'Internal server error while fetching messages' });
  }
});

router.post('/', authenticateToken, async (req, res) => {
  try {
    const senderId = Number(req.user.id);
    const { receiverId, content, type } = req.body;
    const recId = Number(receiverId);

    const [result] = await pool.execute(
      'INSERT INTO messages (sender_id, receiver_id, content, type) VALUES (?, ?, ?, ?)',
      [senderId, recId, content, type || 'text']
    );

    const message = {
      id: result.insertId,
      sender_id: senderId,
      receiver_id: recId,
      content,
      type: type || 'text',
      read_status: 0,
      created_at: new Date()
    };

    res.status(201).json(message);
  } catch (err) {
    console.error('Error sending message:', err);
    res.status(500).json({ error: 'Internal server error while sending message' });
  }
});

router.put('/:id/read', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    await pool.execute('UPDATE messages SET read_status = 1 WHERE id = ?', [id]);
    res.json({ message: 'Message marked as read' });
  } catch (err) {
    console.error('Error marking message as read:', err);
    res.status(500).json({ error: 'Internal server error while marking message as read' });
  }
});

export default router;
