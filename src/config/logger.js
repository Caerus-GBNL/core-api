const winston = require('winston');
const DailyRotateFile = require('winston-daily-rotate-file');
const config = require('./config');

const { format } = winston;

const enumerateErrorFormat = format((info) => {
  if (info instanceof Error) {
    Object.assign(info, { message: info.stack });
  }
  return info;
});

const loggerFormat = format.combine(
  format.timestamp(),
  enumerateErrorFormat(),
  config.env === 'development' ? format.colorize() : format.uncolorize(),
  format.splat(),
  format.printf(({ level, message, timestamp }) => `${timestamp} ${level}: ${message}`),
);

const transports = [
  new winston.transports.Console({
    stderrLevels: ['error'],
  }),
];

if (config.logging.enabled) {
  transports.push(
    new DailyRotateFile({
      level: 'info',
      filename: 'logs/%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      zippedArchive: true,
      maxSize: config.logging.maxFileSize || '20m',
      maxFiles: config.logging.maxFiles || '30d',
    }),
  );
}

const logger = winston.createLogger({
  level: config.env === 'development' ? 'debug' : 'info',
  format: loggerFormat,
  transports,
});

module.exports = logger;
