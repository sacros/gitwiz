import { DatabaseService } from "./db"
import * as R from "ramda"
import { currentEpochTime } from "../utils/time"
import { PAGINATION_LIMIT } from "../constants"
import { ObjectId } from "bson"
import { paginate } from "../utils/pagination"
import { logger } from "../logger/logger"

namespace RedeemService {
  export let newScheme: any
  export let rewards: any
  export let schemeType: any
  export let rewardCodes: any
  export let level: any
  export let skuCode: any
  /**
   * @param {Array} rewardCodes Array of reward codes
   * @returns {boolean} Whther all the rewardcodes are redeemable or not
   */
  export const areRewardsRedeemable = async (providedRewardCodes: string[]) => {
    const searchCriteria = {
      rewardCode: { $in: providedRewardCodes },
      isClaimable: true,
      isClaimed: false,
      approved: true
    }
    rewards = await DatabaseService.rewardCollection
      .find(searchCriteria)
      .toArray()
    rewardCodes = []
    for (let i = 0; i < rewards.length; i++) {
      if (providedRewardCodes.indexOf(rewards[i].rewardCode) >= 0) {
        rewardCodes.push(rewards[i].rewardCode)
      }
    }
    return rewards.length > 0
  }

  export const hasUniqueProvider = async () => {
    const prooviders = R.uniq(rewards.map(reward => reward.provider))
    return prooviders.length === 1
  }

  export const hasUniqueUsers = async () => {
    const ids = R.uniq(rewards.map(reward => reward.user.ids))
    level = rewards[0].user.level
    skuCode = rewards[0].skuCode
    return ids.length === 1
  }

  export const hasUniqueRewardTypes = async () => {
    const rTypes = R.uniq(rewards.map(reward => reward.scheme.scheme.type))
    schemeType = rTypes[0]
    return rTypes.length === 1
  }

  export const redeemRewards = async (redeemRewardsCodes: object) => {
    await DatabaseService.rewardCollection.updateMany(
      {
        rewardCode: { $in: rewardCodes },
        isClaimable: true,
        isClaimed: false
      },
      {
        $set: { isClaimed: true }
      },
      { upsert: false }
    )
    await DatabaseService.rewardRedeemCollection.insertOne(redeemRewardsCodes)
    return
  }
  /**
   * @param {number} level type of user redeeming the reward
   * @returns {boolean} Whther the user is eligible for a dispatch
   */
  export const eligibleForReward = async (redeemlevel: number) => {
    const schemeSearchCriteria = {
      skuCode: rewards[0].skuCode,
      startDate: { $lte: currentEpochTime() },
      endDate: { $gte: currentEpochTime() },
      dispatchToLevel: redeemlevel
    }
    const schemProto = [
      "_id",
      "skuCode",
      "points",
      "conversionUnit",
      "conversionRatio",
      "onlyForApprovedUsers",
      "redeemApprovalRequired",
      "dispatchToLevel",
      "provider",
      "scheme"
    ]
    newScheme = R.pick(
      schemProto,
      await DatabaseService.rewardSchemeCollection.findOne(schemeSearchCriteria)
    )
    return !R.isNil(newScheme)
  }
  /**
   * @param {object} dispatchReward The reward objcet to be duispatched
   * @returns {null}
   */
  export const dispatch = async (dispatchReward: object) => {
    await DatabaseService.rewardCollection.insertOne(dispatchReward)
    return
  }

  /**
   * @returns {boolean} whether it is of type inkind redeem
   */
  export const isInkindRedeem = async () => {
    return rewards[0].scheme.scheme.redeemType === "inkind"
  }

  export const areRewardsAvailable = async (
    providedRewardCodes: string[],
    provider: string
  ) => {
    rewards = await DatabaseService.rewardCollection
      .find({
        rewardCode: { $in: providedRewardCodes },
        "scheme.provider": provider
      })
      .toArray()
    return rewards.length === providedRewardCodes.length
  }

  export const approveRewards = async (rewardCodesToApprove: string[]) => {
    await DatabaseService.rewardCollection.updateMany(
      { rewardCode: { $in: rewardCodesToApprove } },
      { $set: { approved: true } }
    )
    return
  }
  export const rejectRewards = async (rewardCodesToReject: string[]) => {
    await DatabaseService.rewardCollection.updateMany(
      { rewardCode: { $in: rewardCodesToReject } },
      { $set: { approved: false } }
    )
    return
  }
  export const getPendingRewards = async (provider: string, page: number) => {
    const match = {
      approved: false,
      "scheme.provider": provider
    }
    return await paginate(DatabaseService.rewardCollection, page, match)
  }
  export const getApprovedRewards = async (provider: string, page: number) => {
    const match = {
      approved: true,
      "scheme.provider": provider
    }
    return await paginate(DatabaseService.rewardCollection, page, match)
  }

  export const getRewardsBy = async (id: string, page: number) => {
    return await paginate(DatabaseService.rewardRedeemCollection, page, {
      "user.by.id": id
    })
  }

  export const getRewardsFor = async (id: string, page: number) => {
    return await paginate(DatabaseService.rewardRedeemCollection, page, {
      "user.for.id": id
    })
  }
}
export { RedeemService }
