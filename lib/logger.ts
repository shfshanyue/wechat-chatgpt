import { createLogger, format, transports } from 'winston'

export const logger = createLogger({
  transports: [
    new transports.File({
      filename: 'logs/info.log',
      level: 'info'
    }),
    new transports.File({
      filename: 'logs/error.log',
      level: 'error'
    }),
    new transports.File({
      filename: 'logs/warn.log',
      level: 'warning'
    }),
    new transports.Console({})
  ],
  format: format.combine(
    format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    format.errors({ stack: true }),
    format.json(),
  )
})
