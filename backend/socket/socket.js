import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import pool from '../config/db.js';

dotenv.config();

export const initSocket = (io) => {
  io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) {
      return next(new Error("Authentication error"));
    }
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
      if (err) return next(new Error("Authentication error"));
      socket.user = decoded;
      next();
    });
  });

  io.on('connection', (socket) => {
    console.log(`User connected: ${socket.user.username} (${socket.user.id})`);

    socket.join(`user_${socket.user.id}`);

    socket.on('send_message', async (data) => {
      const { receiverId, content, type } = data;
      try {
        const [result] = await pool.execute(
          'INSERT INTO messages (sender_id, receiver_id, content, type) VALUES (?, ?, ?, ?)',
          [socket.user.id, receiverId, content, type || 'text']
        );
        const message = {
          id: result.insertId,
          sender_id: socket.user.id,
          receiver_id: receiverId,
          content,
          type: type || 'text',
          read_status: 0,
          created_at: new Date()
        };

        io.to(`user_${receiverId}`).emit('receive_message', message);
        socket.emit('message_sent', message);
      } catch (err) {
        console.error("Error sending direct message:", err);
        socket.emit('error', { message: 'Failed to send message' });
      }
    });

    socket.on('mark_messages_read', async (data) => {
      const { senderId } = data;
      try {
        await pool.execute(
          'UPDATE messages SET read_status = 1 WHERE sender_id = ? AND receiver_id = ? AND read_status = 0',
          [senderId, socket.user.id]
        );
        io.to(`user_${senderId}`).emit('messages_read', { readerId: socket.user.id });
      } catch (err) {
        console.error("Error marking messages as read:", err);
        socket.emit('error', { message: 'Failed to mark messages as read' });
      }
    });

    socket.on('join_group', async (groupId) => {
      try {
        socket.join(`group_${groupId}`);
        console.log(`User ${socket.user.username} joined group ${groupId}`);
        socket.emit('group_joined', { groupId });
      } catch (err) {
        console.error("Error joining group:", err);
        socket.emit('error', { message: 'Error joining group' });
      }
    });

    socket.on('send_group_message', async (data) => {
      const { groupId, content, type, file_url } = data;
      try {
        const [result] = await pool.execute(
          'INSERT INTO group_messages (group_id, sender_id, content, type, file_url) VALUES (?, ?, ?, ?, ?)',
          [groupId, socket.user.id, content, type || 'text', file_url || null]
        );
        const groupMessage = {
          id: result.insertId,
          group_id: groupId,
          sender_id: socket.user.id,
          content,
          type: type || 'text',
          file_url: file_url || null,
          created_at: new Date()
        };
        io.to(`group_${groupId}`).emit('receive_group_message', groupMessage);
        socket.emit('group_message_sent', groupMessage);
      } catch (err) {
        console.error("Error sending group message:", err);
        socket.emit('error', { message: 'Failed to send group message' });
      }
    });

    socket.on('disconnect', () => {
      console.log(`User disconnected: ${socket.user.username} (${socket.user.id})`);
    });
  });
};
