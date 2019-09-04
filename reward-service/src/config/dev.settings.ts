import { IAppConfig } from "./settings"

const SETTINGS: IAppConfig = {
  APP_PORT: 3002,
  CORS_WHITELIST: [
    "https://staging.original4sure.com",
    "http://staging.original4sure.com"
  ],
  CORS_DEFAULT_ORIGIN: "http://localhost:3002",
  DB_URI:
    "mongodb://admin:rg96fSkYJJPU@ds241823-a0.mlab.com:41823,ds241823-a1.mlab.com:41823/o4s-stag?replicaSet=rs-ds241823"
}

export { IAppConfig, SETTINGS }
