import * as dotenv from "dotenv"
import { logger } from "./logger/logger"
import { DatabaseService } from "./services/db"
import * as Db from "./db"
import * as path from "path"
import { configure } from "./config"

const config = configure()
import { app } from "./app"

// The signals we want to handle
// NOTE: although it is tempting, the SIGKILL signal (9) cannot be intercepted and handled

enum signals {
  SIGHUP = 1,
  SIGINT = 2,
  SIGTERM = 15
}

const signArray = ["SIGHUP", "SIGINT", "SIGTERM"] as const

// Do any necessary shutdown logic for our application here
const shutdown = (signal, value) => {
  logger.warn("shutdown!")
  Db.closeAll()
  process.exit(value)
}
let server
const main = async () => {
  const connectionUri = process.env.MONGODB_URI
  await Db.connect(config.DB_URI)
  server = app.listen(config.APP_PORT, () => {
    DatabaseService.initialize()
    logger.info(`listening on port ${config.APP_PORT}`)
  })

  // Create a listener for each of the signals that we want to handle
  Object.values(signArray).forEach(signal => {
    process.on(signal, () => {
      logger.warn(`process received a ${signal} signal`)
      shutdown(signal, signals[signal])
    })
  })
}

try {
  main()
} catch (err) {
  logger.error(err)
  process.exit(1)
}
export { server }
