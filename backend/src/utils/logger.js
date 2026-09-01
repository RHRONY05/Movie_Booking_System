import pino from 'pino';
import pinoHttp from 'pino-http';

// Create a multi-transport configuration
const transport = pino.transport({
  targets: [
    // 1. Console output (formatted nicely for development)
    ...(process.env.NODE_ENV !== 'production'
      ? [
          {
            target: 'pino-pretty',
            options: { colorize: true, translateTime: 'SYS:standard' },
            level: 'info',
          },
        ]
      : []),
    // 2. File output (JSON logs rotated daily, kept to max 10MB per file)
    {
      target: 'pino-roll',
      options: {
        file: 'logs/app', // creates files like app.2023-10-25
        size: '10m',
        frequency: 'daily',
        mkdir: true,
      },
      level: 'info',
    },
  ],
});

// Configure the base logger with the transports
const logger = pino(
  {
    level: process.env.LOG_LEVEL || 'info',
  },
  transport
);

// Middleware for logging HTTP requests
export const loggerMiddleware = pinoHttp({
  logger,
  customLogLevel: (req, res, err) => {
    if (res.statusCode >= 400 && res.statusCode < 500) return 'warn';
    if (res.statusCode >= 500 || err) return 'error';
    return 'info';
  },
  serializers: {
    req: (req) => ({
      id: req.id,
      method: req.method,
      url: req.url,
      // req.raw is the original Express request object. 
      // We safely grab the userId from the body (if it exists) to track WHO is making the request.
      userId: req.raw?.body?.userId, 
      // We intentionally leave out req.headers and req.remoteAddress to save space and increase security
    }),
    res: (res) => ({
      statusCode: res.statusCode,
      // Leaving out res.headers
    }),
  },
});

export default logger;
