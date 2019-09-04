import * as Joi from "joi"

export namespace validationScheme {
  const skuCodeRule = Joi.object().keys({
    code: Joi.string()
      .min(1)
      .required(),
    description: Joi.string()
  })

  const schemeRule = Joi.object()
    .keys({
      type: Joi.string()
        .valid("milestone", "propagating")
        .required(),
      termination: Joi.number().when("type", {
        is: "propagating",
        then: Joi.required(),
        otherwise: Joi.optional()
      }),
      milestone: Joi.number().when("type", {
        is: "milestone",
        then: Joi.required(),
        otherwise: Joi.optional()
      })
    })
    .required()
  //Joi.string().regex(/^[a-zA-Z0-9]{3,30}$/).min(6).required()
  export const createRewardSchemeRule = {
    skuCode: Joi.string()
      .min(1)
      .required(),
    points: Joi.number()
      .min(1)
      .required(),
    conversionRatio: Joi.number()
      .greater(0)
      .required(),
    conversionUnit: Joi.string()
      .min(2)
      .max(4)
      .required(),
    startDate: Joi.number().required(),
    endDate: Joi.number().required(),
    provider: Joi.string()
      .min(3)
      .max(30)
      .required(),
    dispatchToLevel: Joi.number()
      .min(0)
      .max(5)
      .required(),
    scheme: schemeRule,
    redeemApprovalRequired: Joi.boolean()
  }

  const userRule = Joi.object()
    .keys({
      id: Joi.string().required(),
      level: Joi.number()
        .min(0)
        .max(5)
        .required(),
      context: Joi.string()
    })
    .required()

  const productRule = Joi.object()
    .keys({
      id: Joi.number()
        .min(1)
        .required(),
      sku: skuCodeRule
    })
    .required()

  const scanEventRule = {
    scanId: Joi.string()
      .min(10)
      .required(),
    user: userRule,
    product: productRule
  }
  export const dispatchRewardRule = {
    scanEvents: Joi.array()
      .items(scanEventRule)
      .required()
  }

  export const updateRewardSchemeRule = {
    ...createRewardSchemeRule,
    _id: Joi.string()
      .regex(/^[0-9a-fA-F]{24}$/)
      .required()
  }

  export const deleteRewardSchemeRule = {
    id: Joi.string()
      .regex(/^[0-9a-fA-F]{24}$/)
      .required()
  }

  const errMessage = `Reward code should have at`
  const rewardCodesRule = Joi.array().items(
    Joi.string()
      .min(5)
      .required()
      .error(errors => {
        errors.forEach(e => {
          switch (e.type) {
            case "any.empty":
              e.message = `${errMessage} least one code`
              break
            case "string.min":
              e.message = `${errMessage} least ${e.context.limit} characters!`
              break
            case "string.max":
              e.message = `${errMessage} most ${e.context.limit} characters!`
              break
            default:
              break
          }
        })
        return errors
      })
  )

  export const getRewardRule = {
    user: userRule,
    rewardCodes: rewardCodesRule
  }

  export const approveRewardRule = {
    rewardCodes: rewardCodesRule,
    provider: Joi.string()
      .min(3)
      .max(30)
      .required()
  }

  export const rejectRewardRule = approveRewardRule

  export const getReedemRewardsRule = {
    user: userRule
  }

  export const redeemRewardRule = {
    rewardCodes: rewardCodesRule,
    user: userRule
  }

  export const redeemInKindRewardRule = {
    rewardCode: Joi.string()
      .min(5)
      .required(),
    product: Joi.object().required(),
    user: userRule
  }
}
