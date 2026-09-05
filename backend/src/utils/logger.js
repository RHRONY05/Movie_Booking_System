import pino from 'pino';
import pinoHttp from 'pino-http';

const isTest = process.env.NODE_ENV === 'test';
const isProduction = process.env.NODE_ENV === 'production';

let logger;

if (isTest) {
  // In test environment, keep logger silent for clean, readable Jest console output
  logger = pino({ level: 'silent' });
} else {
  // Multi-transport configuration for Dev & Production
  const transport = pino.transport({
    targets: [
      // 1. Console / stdout output:
      // In Development: use pino-pretty for human-friendly colors
      // In Production / Docker: output structured JSON to stdout so Docker captures it
      ...(!isProduction
        ? [
            {
              target: 'pino-pretty',
              options: { colorize: true, translateTime: 'SYS:standard' },
              level: process.env.LOG_LEVEL || 'info',
            },
          ]
        : [
            {
              target: 'pino/file',
              options: { destination: 1 }, // 1 = process.stdout
              level: process.env.LOG_LEVEL || 'info',
            },
          ]),
      // 2. File output (JSON logs rotated daily, kept to max 10MB per file)
      {
        target: 'pino-roll',
        options: {
          file: 'logs/app', // creates files like app.2023-10-25
          size: '10m',
          frequency: 'daily',
          mkdir: true,
        },
        level: process.env.LOG_LEVEL || 'info',
      },
    ],
  });

  // Configure the base logger with the transports and ISO readable timestamp
  logger = pino(
    {
      level: process.env.LOG_LEVEL || 'info',
      timestamp: pino.stdTimeFunctions.isoTime,
    },
    transport
  );
}

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
