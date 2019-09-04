import * as moment from "moment"
import * as Koa from "koa"
interface ILogger {
  error(message: string): any
  info(message: string): any
}
export const AccessLogger = (
  logger: ILogger,
  delimiter: string = " - ",
  prefix: string = "access"
) => {
  const accessLogger = async (
    ctx: Koa.ParameterizedContext,
    next: () => Promise<any>
  ) => {
    const startTime = Date.now()

    const requestLog: string[] = [
      prefix,
      ctx.get("x-real-ip") || "",
      ctx.request.protocol || "",
      ctx.request.method || "",
      ctx.request.originalUrl || "",
      ctx.request.type
    ]
    try {
      await next()
    } finally {
      const responseTime = (Date.now() - startTime || 0) + " ms"
      const responseLog: string[] = [
        (ctx.response.status || "").toString(),
        (ctx.response.length || "").toString(),
        responseTime
      ]

      const stuffToLog = requestLog.concat(responseLog)

      if (ctx.response.status >= 400) {
        stuffToLog.push(
          JSON.stringify({
            href: ctx.request.href,
            body: ctx.request.body,
            query: ctx.request.query
          })
        )
      }
      if (ctx.response.status >= 400) {
        logger.error(stuffToLog.join(delimiter))
      } else {
        logger.info(stuffToLog.join(delimiter))
      }
    }
  }
  return accessLogger
}
