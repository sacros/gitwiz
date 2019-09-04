import * as Koa from "koa"
import * as Router from "koa-router"
import * as bodyparser from "koa-bodyparser"
import * as cors from "koa-cors"
import * as send from "koa-send"
import * as serve from "koa-static"
import { logger } from "./logger/logger"
import { AccessLogger } from "./logger/access.mw"
import { getSettings } from "./config"
import * as R from "ramda"
import { rewardRouter } from "./api/router"
import { dirname } from "path"
import { globalErrorHandler } from "./errors"

const accessLogger = AccessLogger(logger)

const corsSettings = getSettings()
const corsOriginWhitelist = corsSettings.CORS_WHITELIST.join()
const corsDefaultOrigin = corsSettings.CORS_DEFAULT_ORIGIN

export const app = new Koa()
app.use(
  cors({
    origin: req => {
      const origin = req.get("Origin")
      if (R.contains(origin, corsOriginWhitelist)) {
        return origin
      }
      return corsDefaultOrigin
    }
  })
)
app.use(accessLogger)
app.use(globalErrorHandler)
app.use(bodyparser())

const router = new Router()
router.use("/reward-service/", rewardRouter.routes())
app.use(router.routes())

app.use(serve(dirname(__dirname) + "/docs"))
app.use(function* index() {
  yield send("docs/index.html")
})
