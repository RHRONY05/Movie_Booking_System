import { OAuth2Client } from 'google-auth-library';
import jwt from 'jsonwebtoken';
import pool from '../config/db.js';

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export const googleSignIn = async (req, res) => {
  try {
    const { token } = req.body;
    
    if (!token) {
      return res.status(400).json({ error: 'Google token is required' });
    }

    // Verify the Google ID token
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    
    const payload = ticket.getPayload();
    
    // Logging for testing and learning purposes
    req.log.info('--- Received Google Token ---');
    req.log.info(token); // The raw encrypted token
    req.log.info('--- Decoded Google Payload ---');
    req.log.info(payload); // The decrypted user data
    
    const { sub: googleId, email, name } = payload;

    // Check if user exists in our DB, if not, create them
    let result = await pool.query('SELECT * FROM users WHERE google_id = $1', [googleId]);
    let user = result.rows[0];

    if (!user) {
      result = await pool.query(
        'INSERT INTO users (google_id, email, name) VALUES ($1, $2, $3) RETURNING *',
        [googleId, email, name]
      );
      user = result.rows[0];
    }

    // Generate our own JWT for session management
    const jwtToken = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(200).json({
      message: 'Authentication successful',
      token: jwtToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      }
    });

  } catch (error) {
    req.log?.error?.({ err: error }, 'Google Auth Error') || console.error('Google Auth Error:', error);
    res.status(401).json({ error: 'Invalid or expired Google token' });
  }
};

export const getMe = async (req, res) => {
  try {
    // req.user is set by the authMiddleware
    const userId = req.user.userId;

    const result = await pool.query(
      'SELECT id, email, name, created_at FROM users WHERE id = $1',
      [userId]
    );

    const user = result.rows[0];

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.status(200).json({ user });
  } catch (error) {
    req.log?.error?.({ err: error }, 'Get Me Error') || console.error('Get Me Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
