import winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';
import config from './index.js';

// Niveles pedidos por el briefing, en orden de menor a mayor severidad.
// Winston usa el número para decidir "qué tan grave" es cada uno:
// cuanto más bajo el número, más importante/urgente.
const LOG_LEVELS = {
  levels: {
    fatal: 0,
    error: 1,
    warning: 2,
    info: 3,
    http: 4,
    debug: 5,
  },
  colors: {
    fatal: 'bold red',
    error: 'red',
    warning: 'yellow',
    info: 'green',
    http: 'magenta',
    debug: 'blue',
  },
};

winston.addColors(LOG_LEVELS.colors);

// En desarrollo mostramos todo, hasta debug. En producción, solo lo relevante.
const currentLevel = config.NODE_ENV === 'production' ? 'info' : 'debug';

const consoleFormat = winston.format.combine(
  winston.format.colorize({ all: true }),
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.printf(
    ({ timestamp, level, message }) => `${timestamp} [${level}] ${message}`
  )
);

const fileFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.printf(
    ({ timestamp, level, message }) => `${timestamp} [${level}] ${message}`
  )
);

// Transporte con rotación: un archivo nuevo por día, se guardan
// como máximo 14 días de historial, y cada archivo no supera los 20MB.
const errorFileTransport = new DailyRotateFile({
  level: 'error', // acá quedan SOLO error y fatal (todo lo <= 'error' en severidad)
  dirname: 'logs',
  filename: 'error-%DATE%.log',
  datePattern: 'YYYY-MM-DD',
  maxSize: '20m',
  maxFiles: '14d',
  format: fileFormat,
});

const logger = winston.createLogger({
  levels: LOG_LEVELS.levels,
  level: currentLevel,
  transports: [
    new winston.transports.Console({ format: consoleFormat }),
    errorFileTransport,
  ],
});

export default logger;