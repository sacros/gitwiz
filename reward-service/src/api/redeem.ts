import * as Koa from "koa"
import * as R from "ramda"
import { RedeemService } from "../services/redeem"
import { apiErrorResponse } from "../entity/error"
import { IRedeem } from "../entity/redeem"
import { DatabaseService } from "../services/db"
import { dispatch } from "../entity/dispatch"

export const redeem: Koa.Middleware = async ctx => {
  const { rewardCodes, user, scannuuid } = ctx.request.body
  const redeemableRewards = await RedeemService.areRewardsRedeemable(
    rewardCodes
  )
  if (!redeemableRewards) {
    ctx.status = 409
    return (ctx.body = apiErrorResponse("REWARD_CLAIM"))
  }
  const redeemTypes = RedeemService.rewards.map(
    reward => reward.scheme.scheme.redeemType
  )
  if (redeemTypes.indexOf("inkind") !== -1) {
    ctx.status = 409
    return (ctx.body = apiErrorResponse("INVALID_REDEEM_TYPE"))
  }

  if (!RedeemService.hasUniqueProvider()) {
    ctx.status = 409
    return (ctx.body = apiErrorResponse("MANY_PROVIDERS"))
  }

  if (!RedeemService.hasUniqueUsers()) {
    ctx.status = 409
    return (ctx.body = apiErrorResponse("MANY_USER"))
  }

  if (!RedeemService.hasUniqueRewardTypes()) {
    ctx.status = 409
    return (ctx.body = apiErrorResponse("MANY_TYPES"))
  }

  if (user.level >= RedeemService.level) {
    ctx.status = 403
    return (ctx.body = apiErrorResponse("INVALID_USER"))
  }
  /**
   * All the error handled update reward stated
   */
  const failedRewards = R.difference(rewardCodes, RedeemService.rewardCodes)
  const aggregatedRewardCode = dispatch.generateRewardCode(scannuuid)
  const redeemRewards: IRedeem = {
    rewardCodes: R.uniq(RedeemService.rewardCodes),
    dispatched: RedeemService.schemeType === "milestone" ? false : true,
    aggregatedCode: aggregatedRewardCode,
    user: {
      for: RedeemService.rewards[0].user,
      by: user
    },
    points: RedeemService.rewards.reduce((r, x) => r + x.points, 0)
  }
  await RedeemService.redeemRewards(redeemRewards)
  if (
    RedeemService.schemeType === "propagating" &&
    (await RedeemService.eligibleForReward(user.level))
  ) {
    /**
     * The scheme is propagative and user is eligible for new dispatch
     */
    const dispatchReward: dispatch.IDispatchObject = {
      rewardCode: aggregatedRewardCode,
      approved: true,
      isClaimable: true,
      isClaimed: false,
      points: redeemRewards.points,
      progress: 100,
      scheme: RedeemService.newScheme,
      user: user,
      productId: ["redeem"],
      skuCode: RedeemService.skuCode,
      scanUUID: scannuuid
    }
    await RedeemService.dispatch(dispatchReward)
  }
  ctx.status = 200
  return (ctx.body = {
    success: true,
    data: {
      redeemed: redeemRewards,
      failed: failedRewards
    },
    message: !R.isEmpty(failedRewards)
      ? "Reward(s) partially redeemed"
      : "Reward(s) successfully redeemed"
  })
}

export const inkind: Koa.Middleware = async ctx => {
  const redeemObject: any = R.pick(
    ["product", "rewardCode", "user"],
    ctx.request.body
  )
  const redeemableRewards = await RedeemService.areRewardsRedeemable([
    redeemObject.rewardCode
  ])
  if (!redeemableRewards) {
    ctx.status = 403
    return (ctx.body = apiErrorResponse("REWARD_CLAIM"))
  }

  if (!(await RedeemService.isInkindRedeem())) {
    ctx.status = 409
    return (ctx.body = apiErrorResponse("NOT_INKIND"))
  }
  await RedeemService.hasUniqueUsers()
  if (redeemObject.user.level >= RedeemService.level) {
    ctx.status = 403
    return (ctx.body = apiErrorResponse("INVALID_USER"))
  }
  /**
   * All the error handled update reward stated
   */
  const aggregatedRewardCode = dispatch.generateRewardCode(
    redeemObject.scannuuid
  )
  const redeemRewards: IRedeem = {
    rewardCodes: redeemObject.rewardCode,
    dispatched: false,
    aggregatedCode: aggregatedRewardCode,
    user: {
      for: RedeemService.rewards[0].user,
      by: redeemObject.user
    },
    points: RedeemService.rewards.reduce((r, x) => r + x.points, 0),
    product: redeemObject.product
  }
  RedeemService.redeemRewards(redeemRewards)
  ctx.status = 200
  return (ctx.body = {
    success: true,
    data: redeemRewards,
    message: "Reward successfully redeemed"
  })
}

export const approve: Koa.Middleware = async ctx => {
  const { rewardCodes, provider } = ctx.request.body
  const rewards = await RedeemService.areRewardsAvailable(rewardCodes, provider)
  if (!rewards) {
    ctx.status = 404
    return (ctx.body = apiErrorResponse("REWARD_NOT_EXIST"))
  }
  await RedeemService.approveRewards(rewardCodes)
  ctx.status = 200
  return (ctx.body = {
    success: true,
    message: "Reward(s) approved successfully"
  })
}

export const reject: Koa.Middleware = async ctx => {
  const { rewardCodes, provider } = ctx.request.body
  const rewards = await RedeemService.areRewardsAvailable(rewardCodes, provider)
  if (!rewards) {
    ctx.status = 404
    return (ctx.body = apiErrorResponse("REWARD_NOT_EXIST"))
  }
  await RedeemService.rejectRewards(rewardCodes)
  ctx.status = 200
  return (ctx.body = {
    success: true,
    message: "Reward(s) rejected successfully"
  })
}

export const getPending: Koa.Middleware = async ctx => {
  const provider = ctx.query.provider
  const page = Number(ctx.query.page) || 1
  const rewards = await RedeemService.getPendingRewards(provider, page)
  ctx.status = 200
  return (ctx.body = {
    success: true,
    data: rewards.data,
    pagination: rewards.pagination
  })
}

export const getApproved: Koa.Middleware = async ctx => {
  const provider = ctx.query.provider
  const page = Number(ctx.query.page) || 1
  const rewards = await RedeemService.getApprovedRewards(provider, page)
  ctx.status = 200
  return (ctx.body = {
    success: true,
    data: rewards.data,
    pagination: rewards.pagination
  })
}

export const getReedemRewardsBy: Koa.Middleware = async ctx => {
  const { user } = ctx.request.body
  const page = Number(ctx.query.page) || 1
  const rewards = await RedeemService.getRewardsBy(user.id, page)
  ctx.status = 200
  return (ctx.body = {
    success: true,
    data: rewards.data,
    pagination: rewards.pagination
  })
}

export const getReedemRewardsFor: Koa.Middleware = async ctx => {
  const { user } = ctx.request.body
  const page = Number(ctx.query.page) || 1
  const rewards = await RedeemService.getRewardsFor(user.id, page)
  ctx.status = 200
  return (ctx.body = {
    success: true,
    data: rewards.data,
    pagination: rewards.pagination
  })
}
