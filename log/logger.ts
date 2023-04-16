import { createLogger, format, transports } from 'winston'

export const msgLogger = createLogger({
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
    })
  ],
  format: format.combine(
    format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    format.errors({ stack: true }),
    format.json(),
    format.align(),
    format.simple(),
    format.printf(
      (info) => `${info.level}: ${[info.timestamp]}: ${info.message}`
    )
  )
})
