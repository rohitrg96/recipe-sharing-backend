import winston from 'winston';

// Create a custom log format
const logFormat = winston.format.printf(({ timestamp, level, message, stack }) => {
  return `${timestamp} [${level}]: ${message} ${stack || ''}`;
});

// Create a transport for logging to a file (for production)
const fileTransport = new winston.transports.File({
  filename: 'logs/error.log',
  level: 'error', // Log only errors to file
  format: winston.format.combine(winston.format.timestamp(), logFormat),
});

// Create a transport for logging to the console (for development)
const consoleTransport = new winston.transports.Console({
  level: 'debug', // Log all levels from 'debug' and above
  format: winston.format.combine(
    winston.format.colorize(), // Colorizes log messages in the console
    winston.format.timestamp(),
    logFormat,
  ),
});

// Create the logger instance with the transports
const logger = winston.createLogger({
  level: 'debug', // Default log level (you can change based on your environment)
  transports: [consoleTransport, fileTransport],
});

export default logger;
