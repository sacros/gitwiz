interface IAppConfig {
  APP_PORT: number
  LOG_LEVEL?: string
  DEBUG_PORT?: number
  CORS_WHITELIST: string[]
  CORS_DEFAULT_ORIGIN: string
  DB_URI: string
}

const SETTINGS: IAppConfig = {
  APP_PORT: 3002,
  CORS_WHITELIST: [
    "https://o4s.in",
    "http://o4s.in",
    "http://original4sure.com",
    "https://original4sure.com",
    "http://www.original4sure.com",
    "https://www.original4sure.com"
  ],
  CORS_DEFAULT_ORIGIN: "http://localhost:3002",
  DB_URI:
    "mongodb://heroku_0lqs2vbd:ddotm0pd3visid6s9d9mpcmaib@ds155182-a0.mlab.com:55182,ds155182-a1.mlab.com:55182/heroku_0lqs2vbd?replicaSet=rs-ds155182"
}

export { IAppConfig, SETTINGS }
