import jwt from 'jsonwebtoken';

export const authMiddleware = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const token = authHeader.split(' ')[1];
    
    // Verify the JWT token using our secret
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Attach the user info to the request object so the controller can use it
    req.user = decoded;
    
    next();
  } catch (error) {
    if (req.log) {
      req.log.error({ err: error }, 'JWT Verification Error');
    } else {
      console.error('JWT Error:', error);
    }
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
};
