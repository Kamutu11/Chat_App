import express from 'express';
import pool from '../config/db.js';
import { authenticateToken } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/all', authenticateToken, async (req, res, next) => {
  try {
    const userId = req.user.id;
    const [rows] = await pool.execute(
      `SELECT g.*, 
              CASE WHEN gm.user_id IS NOT NULL THEN 1 ELSE 0 END as isMember
       FROM \`groups\` g
       LEFT JOIN (
         SELECT group_id, user_id FROM \`group_members\` WHERE user_id = ?
       ) gm ON g.id = gm.group_id
       ORDER BY g.created_at DESC`,
      [userId]
    );
    res.json(rows);
  } catch (err) {
    console.error('Error fetching all groups:', err);
    next(err);
  }
});

router.post('/', authenticateToken, async (req, res, next) => {
  try {
    const { name, memberIds } = req.body;
    const createdBy = req.user.id;
    if (!name) {
      return res.status(400).json({ message: 'Group name is required' });
    }
    const [result] = await pool.execute(
      'INSERT INTO `groups` (name, created_by) VALUES (?, ?)',
      [name, createdBy]
    );
    const groupId = result.insertId;
    const members = new Set(memberIds || []);
    members.add(createdBy);
    const memberArray = Array.from(members);
    const values = memberArray.map((userId) => [groupId, userId]);
    if (values.length > 0) {
      await pool.query('INSERT INTO `group_members` (group_id, user_id) VALUES ?', [values]);
    }
    res.status(201).json({ message: 'Group created successfully', groupId });
  } catch (err) {
    console.error('Error creating group:', err);
    next(err);
  }
});

router.get('/:groupId', authenticateToken, async (req, res, next) => {
  try {
    const groupId = Number(req.params.groupId);
    const [groupRows] = await pool.execute('SELECT * FROM `groups` WHERE id = ?', [groupId]);
    if (groupRows.length === 0) {
      return res.status(404).json({ message: 'Group not found' });
    }
    const group = groupRows[0];
    const [members] = await pool.execute(
      'SELECT u.id, u.username FROM `group_members` gm JOIN `users` u ON gm.user_id = u.id WHERE gm.group_id = ?',
      [groupId]
    );
    res.json({ group, members });
  } catch (err) {
    console.error('Error fetching group details:', err);
    next(err);
  }
});

router.get('/my/groups', authenticateToken, async (req, res, next) => {
  try {
    const userId = req.user.id;
    const [rows] = await pool.execute(
      `SELECT g.* FROM \`groups\` g
       JOIN \`group_members\` gm ON g.id = gm.group_id
       WHERE gm.user_id = ?`,
      [userId]
    );
    res.json(rows);
  } catch (err) {
    console.error('Error fetching user groups:', err);
    next(err);
  }
});

router.post('/:groupId/join', authenticateToken, async (req, res, next) => {
  try {
    const groupId = Number(req.params.groupId);
    const userId = req.user.id;
    const [existing] = await pool.execute(
      'SELECT * FROM `group_members` WHERE group_id = ? AND user_id = ?',
      [groupId, userId]
    );
    if (existing.length > 0) {
      return res.status(400).json({ message: 'Already a member' });
    }
    await pool.execute('INSERT INTO `group_members` (group_id, user_id) VALUES (?, ?)', [groupId, userId]);
    res.status(200).json({ message: 'Joined group successfully' });
  } catch (err) {
    console.error('Error joining group:', err);
    next(err);
  }
});

router.post('/:groupId/leave', authenticateToken, async (req, res, next) => {
  try {
    const groupId = Number(req.params.groupId);
    const userId = req.user.id;
    const [existing] = await pool.execute(
      'SELECT * FROM `group_members` WHERE group_id = ? AND user_id = ?',
      [groupId, userId]
    );
    if (existing.length === 0) {
      return res.status(400).json({ message: 'Not a member of this group' });
    }
    await pool.execute('DELETE FROM `group_members` WHERE group_id = ? AND user_id = ?', [groupId, userId]);
    res.status(200).json({ message: 'Left group successfully' });
  } catch (err) {
    console.error('Error leaving group:', err);
    next(err);
  }
});

router.get('/:groupId/messages', authenticateToken, async (req, res, next) => {
  try {
    const groupId = Number(req.params.groupId);
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;

    const query = `
      SELECT * FROM \`group_messages\`
      WHERE group_id = ?
      ORDER BY created_at ASC
      LIMIT ${limit} OFFSET ${offset}
    `;
    const [rows] = await pool.execute(query, [groupId]);
    res.json({ page, limit, messages: rows });
  } catch (err) {
    console.error('Error fetching group messages:', err);
    res.status(500).json({ error: 'Internal server error while fetching group messages' });
  }
});

router.post('/:groupId/messages', authenticateToken, async (req, res, next) => {
  try {
    const groupId = Number(req.params.groupId);
    const senderId = req.user.id;
    const { content, type, file_url } = req.body;
    const [result] = await pool.execute(
      'INSERT INTO `group_messages` (group_id, sender_id, content, type, file_url) VALUES (?, ?, ?, ?, ?)',
      [groupId, senderId, content, type || 'text', file_url || null]
    );
    const groupMessage = {
      id: result.insertId,
      group_id: groupId,
      sender_id: senderId,
      content,
      type: type || 'text',
      file_url: file_url || null,
      created_at: new Date()
    };
    res.status(201).json(groupMessage);
  } catch (err) {
    console.error('Error sending group message:', err);
    res.status(500).json({ error: 'Internal server error while sending group message' });
  }
});

export default router;
