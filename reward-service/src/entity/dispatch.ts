import * as uuid from "uuid"
import { IUser } from "./user"
namespace dispatch {
  export const generateRewardCode = (scanuuid: string): string => {
    return (
      "RC-" +
      uuid
        .v4(scanuuid)
        .replace("-", "")
        .slice(0, 5)
        .toUpperCase()
    )
  }

  export interface IRewardDispatchInput {
    skuCode: string
    productId: string[]
    user: IUser
    scanUUID: string[]
  }

  export interface IDispatchObject extends IRewardDispatchInput {
    rewardCode: string
    approved: boolean
    isClaimable: boolean
    isClaimed: boolean
    points: number
    progress: number
    scheme: object
    _id?: any
  }

  export const schemPrototype = [
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
}

export { dispatch }
