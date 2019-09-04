enum errorCode {
  /**
   * Schme CRUD Errors type
   */
  SCHEME_EXISTS = "This scheme already exists",
  SCHEME_DISPATCHED = "Rewards has been dispatched in this scheme",
  /**
   * Disptach error type
   */
  PRODUCT_EXIST = "This product has already been used for reward",
  SCHEME_NOT_EXIST = "No such reward scheme found",
  SCHEME_EXHAUSTED = "This reward shceme has reached its user limit",
  MAX_CLAIMED = "You have already claimed the maximum reward",
  /**
   * Redeem error type
   */
  REWARD_EMPTY = "NO reward codes provided",
  REWARD_CLAIM = "The provided reward code is not claimable or is claimed",
  MANY_PROVIDERS = "Reward codes are associated with mltiple providers",
  MANY_USER = "Reward codes are associated with multiple users",
  MANY_TYPES = "Multiple types of reward can't be redeemed together",
  INVALID_USER = "The user is not authorized to redeem this reward",
  NOT_INKIND = "This reward is not redeemable as inkind",
  REWARD_NOT_EXIST = "No such reward found",
  REWARD_APPROVAL_STATE_SAME = "Reward approval already set the same",
  ERR_SCHEME_EXISTS = "The scheme already exists",
  INVALID_REDEEM_TYPE = "This is not a valid redeem type"
}

interface IError {
  errorCode: string
  errorMessage: string
}

const apiErrorResponse = (ERR_CODE: string) => {
  const error: IError = {
    errorCode: ERR_CODE,
    errorMessage: errorCode[ERR_CODE]
  }
  return {
    success: false,
    error: error
  }
}
export { errorCode, IError, apiErrorResponse }
