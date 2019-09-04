import * as dotenv from "dotenv"
import * as path from "path"
import * as logger from "winston"
import { IAppConfig, SETTINGS } from "./settings"
import { SETTINGS as SETTINGS_DEV } from "./dev.settings"
import { SETTINGS as SETTINGS_STAGING } from "./staging.settings"

const ENV_TYPE = {
  PRODUCTION: "production",
  STAGING: "staging",
  DEV: "development",
  LOCAL: "local"
}

let _settings_: IAppConfig = SETTINGS

const setSettings = (obj: IAppConfig) => {
  _settings_ = obj
}

const getSettings = (): IAppConfig => {
  return _settings_
}

/**
Setup env
*/

const setupEnv = () => {
  const envpath = path.resolve(__dirname, "../../.env")

  dotenv.config({
    path: envpath
  })
}

const isCorrectEnv = (env): [Error | null, boolean] => {
  const mandatorySettings = ["NODE_ENV"]

  const missingSettings = mandatorySettings.filter(setting => {
    return process.env[setting] ? false : true
  })

  if (missingSettings.length > 0) {
    return [
      new Error(
        `Incorrect Environment. Missing Settings: ${missingSettings.join(",")}`
      ),
      false
    ]
  }

  /**
   * Check if ENV is one of [production, staging, development]
   */

  const isBadNodeEnv =
    Object.keys(ENV_TYPE)
      .map(key => ENV_TYPE[key])
      .indexOf(process.env.NODE_ENV || "") < 0

  if (isBadNodeEnv) {
    return [new Error("Incorrect Environment. ENV is not set correctly"), false]
  } else {
    logger.info("Environment Detected: " + process.env.NODE_ENV)
  }

  return [null, true]
}

const configure = (): IAppConfig => {
  setupEnv()
  const [envErr] = isCorrectEnv(process.env)
  if (envErr) {
    throw envErr
  }
  switch (process.env.NODE_ENV) {
    case ENV_TYPE.PRODUCTION:
      _settings_ = SETTINGS
      break
    case ENV_TYPE.STAGING:
      _settings_ = SETTINGS_STAGING
      break
    case ENV_TYPE.DEV:
      _settings_ = SETTINGS_DEV
      break
    case ENV_TYPE.LOCAL:
      // tslint:disable-next-line:no-require-imports
      _settings_ = require("./local.settings").SETTINGS

      break
    default:
      _settings_ = SETTINGS
  }
  setSettings(_settings_)
  return _settings_
}

const settings = {
  get: (key: string) => {
    if (!(key in _settings_)) {
      return [new Error("key not found in __settings__"), null]
    }
    return [_settings_[key], null]
  }
}

export { configure, getSettings, settings }
