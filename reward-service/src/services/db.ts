import { getCollection } from "../db"

import { AVAILABLE_COLLECTION } from "../constants"
import any from "ramda/es/any"
namespace DatabaseService {
  export let rewardCollection: any
  export let rewardSchemeCollection: any
  export let rewardRedeemCollection: any
  export const initialize = () => {
    rewardCollection = getCollection(AVAILABLE_COLLECTION.REWARD)
    rewardSchemeCollection = getCollection(AVAILABLE_COLLECTION.REWARD_SCHEME)
    rewardRedeemCollection = getCollection(AVAILABLE_COLLECTION.REDEEM)
  }
}

export { DatabaseService }
