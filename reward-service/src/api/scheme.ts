import * as Koa from "koa"
import * as R from "ramda"
import { userLevel, level } from "../entity/user"
import { SchemeService } from "../services/scheme"
import { Scheme } from "../entity/scheme"
import { currentEpochTime } from "../utils/time"
import { DatabaseService } from "../services/db"
import { apiErrorResponse } from "../entity/error"
import { PAGINATION_LIMIT } from "../constants"

export const get: Koa.Middleware = async ctx => {
  const page = Number(ctx.query.page) || 1
  const schemes = await SchemeService.getSchemes(page)
  ctx.status = 200
  return (ctx.body = {
    success: true,
    data: schemes.data,
    pagination: schemes.pagination
  })
}

export const getBySkuCode: Koa.Middleware = async ctx => {
  const { skuCode } = ctx.params
  const page = Number(ctx.query.page) || 1
  const schemes = await SchemeService.getSchmesBySkuCode(skuCode, page)
  ctx.status = 200
  return (ctx.body = {
    success: true,
    data: schemes.data,
    pagination: schemes.pagination
  })
}

export const create: Koa.Middleware = async ctx => {
  const requiredSchemeInput = R.pick(
    Scheme.createRewardSchemeRequestFilter,
    ctx.request.body
  )
  const scheme: Scheme.IScheme = {
    type: requiredSchemeInput.scheme.type,
    redeemType: requiredSchemeInput.scheme.redeemType || "none",
    milestone: 0,
    termination: 0
  }
  const optionalSchemeInput = R.pick(
    Scheme.optionalCreateRewardSchemeRequestFilter,
    ctx.request.body
  )
  const newRewardScheme: Scheme.IRewardSchme = {
    skuCode: requiredSchemeInput.skuCode,
    points: requiredSchemeInput.points,
    conversionUnit: requiredSchemeInput.conversionUnit,
    conversionRatio: requiredSchemeInput.conversionRatio,
    startDate: requiredSchemeInput.startDate,
    endDate: requiredSchemeInput.endDate,
    provider: requiredSchemeInput.provider,
    dispatchToLevel: requiredSchemeInput.dispatchToLevel,
    scheme: scheme,
    description: optionalSchemeInput.description || "",
    totalCount: optionalSchemeInput.totalCount || 0,
    claimedCount: 0,
    onlyForApprovedUsers: optionalSchemeInput.onlyForApprovedUsers || false,
    redeemApprovalRequired: optionalSchemeInput.redeemApprovalRequired || false,
    lastModified: currentEpochTime()
  }
  const isSchemeDuplicate_ = await SchemeService.isSchemeDuplicate(
    newRewardScheme
  )
  if (isSchemeDuplicate_) {
    ctx.status = 409
    return (ctx.body = apiErrorResponse("ERR_SCHEME_EXISTS"))
  }

  if (scheme.type === "propagating") {
    newRewardScheme.scheme.termination = requiredSchemeInput.scheme.termination
    const newRewardSchemeToSave: Scheme.IRewardSchme[] = []
    const terminationLevel = newRewardScheme.scheme.termination
    const startingLevel = newRewardScheme.dispatchToLevel
    Object.keys(userLevel).forEach(k => {
      if (userLevel[k] <= startingLevel && userLevel[k] >= terminationLevel) {
        const o = { ...newRewardScheme }
        o.dispatchToLevel = userLevel[k]
        newRewardSchemeToSave.push(o)
      }
    })
    const result = await SchemeService.insertManyScheme(newRewardSchemeToSave)
    ctx.status = 201
    ctx.body = {
      success: true,
      message: "Successfully created",
      data: result.ops
    }
  } else if (scheme.type === "milestone") {
    newRewardScheme.scheme.milestone = requiredSchemeInput.scheme.milestone || 1
    // newRewardScheme.scheme.userDispatchLimit = 0
    const result = await SchemeService.insertOneScheme(newRewardScheme)
    ctx.status = 201
    ctx.body = {
      success: true,
      message: "Successfully created",
      data: result.ops
    }
  }
}

export const update: Koa.Middleware = async ctx => {
  const updateScheme = ctx.request.body
  const scheme = await SchemeService.getSchemeById(updateScheme._id)
  if (R.isEmpty(scheme)) {
    /**
     * Scheme does not exist return error
     */
    ctx.status = 404
    return (ctx.body = apiErrorResponse("SCHEME_NOT_EXIST"))
  }
  if (await SchemeService.isClaimedScheme(updateScheme._id)) {
    /**
     * Reward has been dispatched under this scheme
     */
    ctx.status = 409
    return (ctx.body = apiErrorResponse("SCHEME_DISPATCHED"))
  }
  /**
   * TODO: Verify if the provided data for update is valid and can be updated
   */
  const res = await SchemeService.updateScheme(
    updateScheme._id,
    R.omit(["_id"], updateScheme)
  )
  ctx.status = 202
  ctx.body = {
    success: true,
    message: "Successfully updated"
  }
}

export const remove: Koa.Middleware = async ctx => {
  const { id } = ctx.params
  const deletedScheme = await SchemeService.deleteScheme(id)
  if (deletedScheme) {
    ctx.status = 202
    return (ctx.body = {
      success: true,
      message: "Scheme Succesfully deleted"
    })
  } else {
    ctx.status = 409
    return (ctx.body = apiErrorResponse("SCHEME_DISPATCHED"))
  }
}
