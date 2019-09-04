// import * as dotenv from "dotenv"
// import { _setConfig, getConfig } from "../config"
// import { logger } from "../logger/logger"

// import * as Db from "../db"

// import { MongoMemoryServer } from "mongodb-memory-server"
// _setConfig({
//   connectionUri: {
//     db: process.env.DB_URI || "mongodb://localhost:27017/o4s-stage"
//   },
//   property: {
//     redemptionUriTemplate: process.env.REDEMPTION_URI_TEMPLATE,
//     registrationUri: process.env.REGISTRATION_URI
//   },
//   cors: {
//     whitelist: process.env["CORS.WHITELIST"] || "",
//     defaultOrigin: process.env["CORS.DEFAULT_ORIGIN"] || ""
//   },
//   port: 4002
// })

// import { app } from "../app"
// process.title = "IntegrationTest"
// const main = async () => {
//   const mongoServer = new MongoMemoryServer()
//   const mongoUri = await mongoServer.getConnectionString()
//   const config = getConfig()
//   config.connectionUri.db = mongoUri
//   _setConfig(config)
//   await Db.connect(mongoUri)
//   const server = app.listen(config.port, () => {
//     logger.info(`listening on port ${config.port}`)
//   })
//   return server
// }

// export { main }
