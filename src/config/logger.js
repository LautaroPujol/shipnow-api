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
const currentLevel = config.LOG_LEVEL || (config.NODE_ENV === 'production' ? 'info' : 'debug');

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

// Transporte de errores: rotación diaria, solo error/fatal (<= 'error' en severidad).
const errorFileTransport = new DailyRotateFile({
  level: 'error',
  dirname: 'logs',
  filename: 'error-%DATE%.log',
  datePattern: 'YYYY-MM-DD',
  maxSize: '20m',
  maxFiles: '14d',
  format: fileFormat,
});

// Transporte de actividad general: rotación diaria, TODO lo que esté
// dentro del nivel activo (currentLevel) queda acá, no solo errores.
const combinedFileTransport = new DailyRotateFile({
  level: currentLevel,
  dirname: 'logs',
  filename: 'combined-%DATE%.log',
  datePattern: 'YYYY-MM-DD',
  maxSize: '20m',
  maxFiles: '14d',
  format: fileFormat,
});

// La consola solo tiene sentido mientras desarrollás: en producción,
// nadie mira la terminal de un proceso corriendo en un servidor.
const transports = [errorFileTransport, combinedFileTransport];
if (config.NODE_ENV === 'development') {
  transports.push(new winston.transports.Console({ format: consoleFormat }));
}

const logger = winston.createLogger({
  levels: LOG_LEVELS.levels,
  level: currentLevel,
  transports,
});

export default logger;