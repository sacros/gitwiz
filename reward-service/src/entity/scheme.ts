namespace Scheme {
  export interface IRewardSchemeRequired {
    skuCode: string
    points: number
    conversionUnit: string
    conversionRatio: number
    startDate: number
    endDate: number
    provider: string
    dispatchToLevel: number
    scheme: IScheme
  }

  export interface IRewardSchemeOptional {
    description: string
    totalCount: number
    claimedCount: number
    onlyForApprovedUsers: boolean
    redeemApprovalRequired: boolean
  }

  export interface IScheme {
    type: schemeType
    userDispatchLimit?: number
    redeemType?: redeemType
    milestone: number
    termination: number
  }

  type schemeType = "milestone" | "legacy" | "propagating"
  type redeemType = "none" | "inkind" | "propagatingCredit"

  export interface IRewardSchme
    extends IRewardSchemeRequired,
      IRewardSchemeOptional {
    lastModified: number
  }

  export interface IPagination {
    next: string
    previous: string
  }

  export const createRewardSchemeRequestFilter = [
    "skuCode",
    "points",
    "conversionRatio",
    "conversionUnit",
    "startDate",
    "endDate",
    "provider",
    "dispatchToLevel",
    "scheme",
    "description"
  ]

  export const optionalCreateRewardSchemeRequestFilter = [
    "description",
    "totalCount",
    "onlyForApprovedUsers",
    "redeemApprovalRequired"
  ]
}

export { Scheme }
