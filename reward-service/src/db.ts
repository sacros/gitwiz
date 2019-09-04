import * as logger from "winston"
import * as mongo from "mongodb"
import { AVAILABLE_COLLECTION } from "./constants"
import { getSettings } from "./config"

const MongoClient = mongo.MongoClient

// singleton
const dbs = {}
const clients: mongo.MongoClient[] = []
const setDb = (uri: string, db: mongo.Db) => {
  logger.info(`setting db with name: ${uri}`)
  dbs[uri] = db
  logger.info(`dbs available: ${Object.keys(dbs).join(",")}`)
}

export const get = (uri: string): mongo.Db => {
  if (!dbs[uri]) {
    logger.error(`db with name: ${uri} not found`)
  }
  return dbs[uri]
}

export const connect = async (connectionUri: string): Promise<mongo.Db> => {
  logger.info(`uri: ${connectionUri}`)

  const client = await MongoClient.connect(connectionUri, {
    useNewUrlParser: true,
    ignoreUndefined: true
  })
  const db = client.db()
  setDb(connectionUri, db)
  clients.push(client)
  return db
}

export const getCollection = (
  name: AVAILABLE_COLLECTION,
  uri: string = getSettings().DB_URI
) => {
  const db = get(uri)
  return db.collection(name)
}

export const closeAll = () => {
  logger.info(`closing db clients total : ${clients.length}`)
  clients.forEach(client => {
    client.close()
  })
  logger.info("all db connections closed")
}
