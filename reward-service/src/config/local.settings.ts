import { IAppConfig } from "./settings"

const SETTINGS: IAppConfig = {
  APP_PORT: 3002,
  LOG_LEVEL: "info",
  DEBUG_PORT: 9229,
  CORS_WHITELIST: [
    "https://o4s.in",
    "http://o4s.in",
    "http://original4sure.com",
    "https://original4sure.com",
    "http://www.original4sure.com",
    "https://www.original4sure.com"
  ],
  CORS_DEFAULT_ORIGIN: "http://localhost:3002",
  DB_URI: "mongodb://mongodb/o4s"
}

export { IAppConfig, SETTINGS }
