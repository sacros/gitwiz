import * as Koa from "koa"
import { RewardService } from "../services/rewards"
import { IUser } from "../entity/user"
import { dispatch } from "../entity/dispatch"
import { apiErrorResponse } from "../entity/error"
import { DatabaseService } from "../services/db"
import * as R from "ramda"
/**
 * Dispatch Algorithm
 * Input scan details
 * scandetails = {
 *    id, skuCode, userDetail
 * }
 * check if any scheme is availabe or not'
 * If scheme not available
 *    Make an entry in dispatch return error
 * If scheme exist:
 *    check if there is an entry with the id
 *    If there is retrurn error
 *    else:
 *        check if type is milestone or other
 *        if milestone
 *          add product, increase progress, by default is claimable false
 *          once completes the level set isclaiabale true
 *        else
 *          check if user is approved or not for  reward, set a flag
 *          make an entry return success
 *
 */

const dispatchRewards: Koa.Middleware = async ctx => {
  const scanEvents = ctx.request.body.scanEvents
  const scanEventsErrors: any = {}
  const validScanEvents: any = []
  const uniqueRewards: any = []
  let rPosition: number = -1
  for (let i = 0; i < scanEvents.length; i++) {
    const scanEvent = Object.assign({}, scanEvents[i])
    if (
      await RewardService.doesProductExists(
        scanEvent.product.id,
        scanEvent.user.level
      )
    ) {
      if (scanEventsErrors.PRODUCT_EXIST === undefined) {
        scanEventsErrors.PRODUCT_EXIST = []
      }
      scanEventsErrors.PRODUCT_EXIST.push(scanEvent)
    } else if (
      !(await RewardService.doesSchemeExists(
        scanEvent.product.sku.code,
        scanEvent.user.level
      ))
    ) {
      if (scanEventsErrors.SCHEME_NOT_EXIST === undefined) {
        scanEventsErrors.SCHEME_NOT_EXIST = []
      }
      scanEventsErrors.SCHEME_NOT_EXIST.push(scanEvent)
    } else if (
      RewardService.scheme.totalCount > 0 &&
      RewardService.scheme.claimedCount >= RewardService.scheme.totalCount
    ) {
      if (scanEventsErrors.SCHEME_EXHAUSTED === undefined) {
        scanEventsErrors.SCHEME_EXHAUSTED = []
      }
      scanEventsErrors.SCHEME_EXHAUSTED.push(scanEvent)
    } else {
      /**
       * All validations are done, ready to dispatch a new reward
       */
      const dispatchToUser: IUser = scanEvent.user
      const finalDispatachDocument: dispatch.IDispatchObject = {
        scheme: R.pick(dispatch.schemPrototype, RewardService.scheme),
        user: dispatchToUser,
        productId: [scanEvent.product.id],
        skuCode: scanEvent.product.sku.code,
        scanUUID: [scanEvent.scanId],
        approved: !RewardService.scheme.redeemApprovalRequired,
        isClaimed: false,
        isClaimable: true,
        rewardCode: dispatch.generateRewardCode(scanEvent.scanId),
        points: RewardService.scheme.points,
        progress: 100
      }
      if (RewardService.scheme.scheme.type === "milestone") {
        /**
         * RewardType is milestone hence check if the reward is in progress
         */
        const rewardInProgress = await RewardService.isRewardInProgress(
          dispatchToUser.id,
          dispatchToUser.level
        )
        if (rewardInProgress && rewardInProgress.progress < 100) {
          /**
           * RewardService scheme is already for progress add the product id
           */
          rewardInProgress.scanUUID.push(scanEvent.scanId)
          rewardInProgress.productId.push(scanEvent.product.id)
          rewardInProgress.points += RewardService.scheme.points
          const milestone = RewardService.scheme.scheme.milestone
          rewardInProgress.progress = Math.round(
            (rewardInProgress.productId.length / milestone) * 100
          )
          rewardInProgress.isClaimable = rewardInProgress.progress >= 100
          await RewardService.dispatchReward(rewardInProgress)
          rPosition = uniqueRewards.indexOf(rewardInProgress._id.toString())
          if (rPosition === -1) {
            uniqueRewards.push(rewardInProgress._id.toString())
            validScanEvents.push(rewardInProgress)
          } else {
            validScanEvents[rPosition] = rewardInProgress
          }
        } else {
          /**
           * Rewards is not in progress
           * Create a new reward dispatch object for the user and save it
           */
          finalDispatachDocument.progress = Math.round(
            100 / RewardService.scheme.scheme.milestone
          )
          finalDispatachDocument.isClaimable =
            finalDispatachDocument.progress >= 100 ? true : false
          await RewardService.dispatchReward(finalDispatachDocument)
          rPosition = uniqueRewards.indexOf(
            finalDispatachDocument._id.toString()
          )
          if (rPosition === -1) {
            uniqueRewards.push(finalDispatachDocument._id.toString())
            validScanEvents.push(finalDispatachDocument)
          } else {
            validScanEvents[rPosition] = finalDispatachDocument
          }
        }
      } else {
        RewardService.dispatchReward(finalDispatachDocument)
        rPosition = uniqueRewards.indexOf(finalDispatachDocument._id.toString())
        if (rPosition === -1) {
          uniqueRewards.push(finalDispatachDocument._id.toString())
          validScanEvents.push(finalDispatachDocument)
        } else {
          validScanEvents[rPosition] = finalDispatachDocument
        }
      }
    }
  }

  const failureObject: any[] = []

  for (const key of Object.keys(scanEventsErrors)) {
    const obj = {
      error: key,
      object: scanEventsErrors[key]
    }
    failureObject.push(obj)
  }

  if (!R.isEmpty(validScanEvents)) {
    return (ctx.body = {
      success: true,
      data: validScanEvents,
      failures: failureObject
    })
  } else {
    return (ctx.body = {
      success: false,
      data: [],
      failed: failureObject
    })
  }
}

const getRewards: Koa.Middleware = async ctx => {
  const { user, rewardCodes } = ctx.request.body
  const page = Number(ctx.query.page) || 1
  const rewards = await RewardService.getRewards(user.id, page, rewardCodes)
  ctx.status = 200
  return (ctx.body = {
    success: true,
    data: rewards.data,
    pagination: rewards.pagination
  })
}

export { dispatchRewards, getRewards }
