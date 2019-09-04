import { currentEpochTime } from "../utils/time"
import { DatabaseService } from "./db"
import * as R from "ramda"
import { paginate } from "../utils/pagination"

namespace RewardService {
  export let scheme: any

  /**
   * @param {string} id
   * @returns {boolean} Whether the product has already scanned by same type
   * of user
   */
  export const doesProductExists = async (
    productId: string,
    userLevel: number
  ) => {
    const existingProduct = await DatabaseService.rewardCollection
      .find({
        productId: productId,
        "user.level": userLevel
      })
      .toArray()
    return existingProduct.length > 0
  }

  /**
   * @param {string} skuCode
   * @param {number} level
   * @returns {boolean} whether the scheme exists or not
   */
  export const doesSchemeExists = async (skuCode: string, level: number) => {
    const schemeDetails = {
      skuCode: skuCode,
      startDate: { $lte: currentEpochTime() },
      endDate: { $gte: currentEpochTime() },
      dispatchToLevel: level
    }
    scheme = await DatabaseService.rewardSchemeCollection.findOne(schemeDetails)
    return scheme === null ? false : true
  }

  /**
   * @param {string} skuCode recieved sku code
   * @param {number} id User Identifier Id
   * @param {number} level User type
   * @returns {boolean}
   */
  export const hasUserClaimedMaximumReward = async (
    skuCode: string,
    id: string,
    level: number
  ) => {
    if (scheme.scheme.userDispatchLimit > 0) {
      const limitCriteria = {
        skuCode: skuCode,
        "user.id": id,
        "user.level": level
      }
      const rewards = await DatabaseService.rewardCollection.countDocuments(
        limitCriteria
      )
      return rewards >= scheme.scheme.userDispatchLimit
    }
    return false
  }
  const increaseClaimedCount = async () => {
    await DatabaseService.rewardSchemeCollection.updateOne(
      { _id: scheme._id },
      { $inc: { claimedCount: 1 } }
    )
    return
  }
  /**
   * @param {Object} reward Reward to be dispatched
   * @returns {null}
   */
  export const dispatchReward = async (reward: object) => {
    if ("_id" in reward) {
      await DatabaseService.rewardCollection.save(reward)
    } else {
      await DatabaseService.rewardCollection.insertOne(reward)
      await increaseClaimedCount()
    }
    return
  }
  /**
   * @param {string} id User Identifier Id
   * @param {number} level User Identifier type / level
   * @returns {boolean|object} If found data will retrurn object else  false
   */
  export const isRewardInProgress = async (id: string, level: number) => {
    const rewardProgressSearch = {
      "user.id": id,
      "user.level": level,
      "scheme._id": scheme._id
    }
    const reward = await DatabaseService.rewardCollection.findOne(
      rewardProgressSearch
    )
    // return ( !reward || reward == null) ?  false : reward
    return reward
  }

  export const getRewards = async (
    id: string,
    page: number,
    rewardCodes?: string[]
  ) => {
    const searchCriteria = {
      "user.id": id,
      rewardCode: { $in: rewardCodes }
    }
    if (rewardCodes === undefined) {
      delete searchCriteria.rewardCode
    }
    return await paginate(
      DatabaseService.rewardCollection,
      page,
      searchCriteria
    )
  }
}
export { RewardService }
