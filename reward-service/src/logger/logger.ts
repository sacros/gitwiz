import * as iExpress from "express"
import * as logger from "winston"

/** Setup application logger */

logger.remove(logger.transports.Console)

logger.addColors({
  debug: "green",
  info: "cyan",
  silly: "magenta",
  warn: "yellow",
  error: "red"
})

logger.add(logger.transports.Console, {
  level: process.env.LOG_LEVEL || "info",
  colorize: true
})
export { logger }
