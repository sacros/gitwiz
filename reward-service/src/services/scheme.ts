import { DatabaseService } from "./db"
import { PAGINATION_LIMIT } from "../constants"
import { ObjectId } from "bson"
import { currentEpochTime } from "../utils/time"
import { paginate } from "../utils/pagination"
namespace SchemeService {
  /**
   * @param {object} scheme Schme to be created
   * @returns {null}
   */
  export const createNewScheme = async (scheme: object) => {
    return
  }
  /**
   * @returns {Array} Array of schemes
   */
  export const getSchemes = async (page: number) => {
    return await paginate(DatabaseService.rewardSchemeCollection, page, {})
  }
  /**
   * @param {Array} skuCodes List of sku codes
   * @returns {Array} schemes under that sku code
   */
  export const getSchmesBySkuCode = async (skuCode: string, page: number) => {
    return await paginate(DatabaseService.rewardSchemeCollection, page, {
      skuCode: skuCode
    })
  }
  /**
   * @param {string} schemeId Id of the schme which needs to be deleted
   * @returns {boolean} If scheme is deleted or not
   * @description Will be only be able to delete if the no reward is claimed
   */
  export const deleteScheme = async (schemeId: string) => {
    const scheme = await DatabaseService.rewardSchemeCollection.deleteOne({
      _id: new ObjectId(schemeId),
      claimedCount: 0
    })
    return scheme.deletedCount === 1
  }
  /**
   * @param {string} schemeId Id of the scheme to be updated
   * @param {object} updates data to be updated
   * @returns {boolean} If it was successfull operation
   */
  export const updateScheme = async (schemeId: string, updates: object) => {
    await DatabaseService.rewardSchemeCollection.update(
      { _id: new ObjectId(schemeId), claimedCount: 0 },
      { $set: updates },
      { upsert: false }
    )
  }
  /**
   * @param {string} schemeId Id of the schme
   * @returns {Array} Array of scheme
   */
  export const getSchemeById = async (schemeId: string) => {
    return await DatabaseService.rewardSchemeCollection
      .find({ _id: new ObjectId(schemeId) })
      .toArray()
  }
  /**
   * @param {string} schemeId Id of the reward scheme
   * @returns {boolean} If it has been claimed yet or not
   */
  export const isClaimedScheme = async (schemeId: string) => {
    const scheme = await DatabaseService.rewardSchemeCollection
      .find({ _id: new ObjectId(schemeId), claimedCount: 0 })
      .toArray()
    return scheme.length === 0
  }
  export const isSchemeDuplicate = async (obj: any) => {
    const multiple = Array.isArray(obj)
    const serachCriteria = {
      skuCode: multiple ? obj[0].skuCode : obj.skuCode,
      startDate: multiple ? { $lte: obj[0].endDate } : { $lte: obj.endDate },
      endDate: multiple ? { $gte: obj[0].startDate } : { $gte: obj.startDate },
      dispatchToLevel: multiple
        ? { $in: obj.map(o => o.dispatchToLevel) }
        : obj.dispatchToLevel
    }
    const res = await DatabaseService.rewardSchemeCollection
      .find(serachCriteria)
      .toArray()
    return res.length > 0
  }
  export const isSchemeDatesValid = async (obj: any, res: any) => {
    const now = currentEpochTime()
    if (res.startDate < now || res.endDate < now) {
      return false
    }
    if (obj.startDate < now || obj.endDate < now) {
      return false
    }
    if (obj.startDate > obj.endDate) {
      return false
    }
    obj.skuCode = res.skuCode
    obj.dispatchToLevel = res.dispatchToLevel
    return !(await isSchemeDuplicate(obj))
  }
  export const insertOneScheme = async (schemeObject: object) => {
    return DatabaseService.rewardSchemeCollection.insertOne(schemeObject)
  }
  export const insertManyScheme = async (schemeObject: any) => {
    return DatabaseService.rewardSchemeCollection.insertMany(schemeObject)
  }
}
export { SchemeService }
