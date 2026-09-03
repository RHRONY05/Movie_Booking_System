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

// Middleware to capture the response body before it's sent out
export const responseBodyCapture = (req, res, next) => {
  const originalSend = res.send;
  res.send = function (body) {
    // Attempt to parse the body as JSON if possible so it logs cleanly
    try {
      res.locals.responseBody = JSON.parse(body);
    } catch (e) {
      res.locals.responseBody = body;
    }
    return originalSend.apply(this, arguments);
  };
  next();
};

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
      // We grab userId from body, or if using authMiddleware, we could grab it from req.raw.user
      userId: req.raw?.body?.userId || req.raw?.user?.userId, 
    }),
    res: (res) => ({
      statusCode: res.statusCode,
      // Log the captured response body (from our custom middleware)
      body: res.raw?.locals?.responseBody,
    }),
  },
});

export default logger;
