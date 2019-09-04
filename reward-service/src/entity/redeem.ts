import { IUser } from "./user"

interface IRedeem {
  rewardCodes: string[]
  user: {
    for: IUser
    by: IUser
  }
  aggregatedCode: string
  dispatched: boolean
  points: number
  product?: object
}

export { IRedeem }
