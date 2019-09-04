import * as Router from "koa-router"
import * as RewardScheme from "./scheme"
import { validationScheme } from "../middleware/validator"
import { dispatchRewards, getRewards } from "./reward"
import * as RewardRedeem from "./redeem"
import * as validate from "koa2-validation"

export const rewardRouter = new Router()

/**
 * @api {get} /reward-service/get
 * @apiName GetRewards- ALl rewards
 * @apiGroup RewardScheme
 * @apiVersion 1.0.0
 * @apiDescription This endpoint will provide list of reward scheme by the
 *                  company who is requesting for rewards.
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *     [
 *          {
 *              "description" : "Some reward scheme"
 *              "skuCode" : "Ashirwatd-Delhi-Atta-5",
 *              "points" : 2,
 *              "conversionRatio" : 1,
 *              "conversionUnit" : "INR",
 *              "startDate" : "01/08/2019",
 *              "endDate" : "31/12/2019",
 *              "totalCount" : 20000,
 *              "claimedCount" : 650,
 *              "onlyForApprovedUsers" : false,
 *              "redeemApprovalRequired" : true,
 *              "provider" : "ITC",
 *              "dispatchToLevel" : "Retailer"
 *              "createdAt" : "27/07/2019",
 *              "scheme" : {
 *                      "type" : "Propogative",
 *                      "termination" : stockist
 *               }
 *          },
 *          {
 *             "pagination" : {
 *                     "next" : "some mongo_id",
 *                      "previous" : "some_mongo_id"
 *              }
 *           }
 *     ]
 */
rewardRouter.get("get", RewardScheme.get)
/**
 * @api {get} /reward-service/get/:id
 * @apiName GetRewardsBySkuCode- List Reward by SkuCode
 * @apiGroup RewardScheme
 * @apiVersion 1.0.0
 * @apiDescription This endpoint will provide list of reward scheme by the
 *                  company who is requesting for rewards.
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *          "description" : "Some reward scheme"
 *          "skuCode" : "Ashirwatd-Delhi-Atta-5",
 *          "points" : 2,
 *          "conversionRatio" : 1,
 *          "conversionUnit" : "INR",
 *          "startDate" : "01/08/2019",
 *          "endDate" : "31/12/2019",
 *          "totalCount" : 20000,
 *          "claimedCount" : 650,
 *          "onlyForApprovedUsers" : false,
 *          "redeemApprovalRequired" : true,
 *          "provider" : "ITC",
 *          "dispatchToLevel" : "Retailer"
 *          "createdAt" : "27/07/2019",
 *          "scheme" : {
 *                  "type" : "Propogative",
 *                  "termination" : stockist
 *           }
 *      }
 */
rewardRouter.get("get/:skuCode", RewardScheme.getBySkuCode)
/**
 * @api {post} /reward-service/create
 * @apiName CreateReward- Create a new reward Scheme
 * @apiGroup RewardScheme
 * @apiVersion 1.0.0
 * @apiDescription This endpoint is meant to create a reward scheme,
 *                  A reward scheme can only be created by companies
 *                  One company can not create reward on behalf of others.
 * @apiParamExample {json} Request Example:
 *     {
 *          "description" : "Some reward scheme"
 *          "skuCode" : "Ashirwatd-Delhi-Atta-5",
 *          "points" : 2,
 *          "conversionRatio" : 1,
 *          "conversionUnit" : "INR",
 *          "startDate" : "01/08/2019",
 *          "endDate" : "31/12/2019",
 *          "totalCount" : 20000,
 *          "claimedCount" : 650,
 *          "onlyForApprovedUsers" : false,
 *          "redeemApprovalRequired" : "",
 *          "provider" : "ITC",
 *           "dispatchToLevel" : "Retailer"
 *          "scheme" : {
 *              "type" : "Propogative",
 *              "termination" : stockist
 *          }
 *      }
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *      "success" : true,
 *      "message" : "Succesfully created"
 *      "data":{
 *              "_id" : ObjectId("mongoId"),
 *              "description" : "Some reward scheme"
 *              "skuCode" : "Ashirwatd-Delhi-Atta-5",
 *              "points" : 2,
 *              "conversionRatio" : 1,
 *              "conversionUnit" : "INR",
 *              "startDate" : "01/08/2019",
 *              "endDate" : "31/12/2019",
 *              "totalCount" : 20000,
 *              "claimedCount" : 650,
 *              "onlyForApprovedUsers" : false,
 *              "redeemApprovalRequired" : true,
 *              "provider" : "ITC",
 *              "dispatchToLevel" : "Retailer"
 *              "createdAt" : "27/07/2019",
 *              "scheme" : {
 *                      "type" : "Propogative",
 *                      "termination" : stockist
 *               }
 *          }
 *     }
 *
 * @apiErrorExample {json} Error-Response
 *      HTTP/1.1 200 OK
 *      {
 *          "success" : false,
 *          "message" : "Unable To create reward scheme",
 *          "error" : {
 *              "code" : "ERR_SCHEME_EXISTS",
 *              "message" : "Scheme already exists"
 *          }
 *      }
 *
 */
rewardRouter.post(
  "create",
  validate({ body: validationScheme.createRewardSchemeRule }),
  RewardScheme.create
)
/**
 * @api {put} /reward-service/update
 * @apiName UpdateRewards- Update Reward Scheme
 * @apiGroup RewardScheme
 * @apiVersion 1.0.0
 * @apiDescription This endpoint is used to update a scheme Few
 *                parameters can't be updated and one need to create new scheme.
 * @apiParamExample {json} Request Example:
 *     {
 *          "_id" : "mongoObjectId"
 *          "points" : 5,
 *          "conversionRatio" : 10,
 *          "conversionUnit" : "INR"
 *      }
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *      "success" : true,
 *      "message" : "Succesfully created"
 *      "data":{
 *              "_id" : ObjectId("mongoId"),
 *              "description" : "Some reward scheme"
 *              "skuCode" : "Ashirwatd-Delhi-Atta-5",
 *              "points" : 5,
 *              "conversionRatio" : 10,
 *              "conversionUnit" : "INR",
 *              "startDate" : "01/08/2019",
 *              "endDate" : "31/12/2019",
 *              "totalCount" : 20000,
 *              "claimedCount" : 650,
 *              "onlyForApprovedUsers" : false,
 *              "redeemApprovalRequired" : true,
 *              "provider" : "ITC",
 *              "dispatchToLevel" : "Retailer"
 *              "createdAt" : "27/07/2019",
 *              "scheme" : {
 *                      "type" : "Propogative",
 *                      "termination" : stockist
 *               }
 *          }
 *     }
 *
 * @apiErrorExample {json} Error-Response
 *      HTTP/1.1 200 OK
 *      {
 *          "success" : false,
 *          "message" : "Unable To cUpdate scheme"
 *          "error" : {
 *              "code" : "ERR_SKU_CODE",
 *              "message" : "Sku code can not be modified, create a new scheme"
 *          }
 *      }
 *
 */
rewardRouter.put(
  "update",
  validate({ body: validationScheme.updateRewardSchemeRule }),
  RewardScheme.update
)
/**
 * @api {delete} /reward-service/delete
 * @apiName DeleteReward- Delete a Reward
 * @apiGroup RewardScheme
 * @apiVersion 1.0.0
 * @apiDescription This endpoint is used to delete a reward scheme. Once deleted
 *              one can not recover it.
 * @apiParamExample {json} Request Example:
 *     {
 *          "rewardSchemeId" : "MongoObjectId"
 *      }
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *      "success" : true,
 *      "message" : "Reward succesfully deleted"
 *     }
 *
 * @apiErrorExample {json} Error-Response
 *      HTTP/1.1 200 OK
 *      {
 *          "success" : false,
 *          "message" : "Unable To delete reward"
 *          "error" : {
 *              "code" : "ERRGiven reward does not exist"
 *          }
 *      }
 *
 */
rewardRouter.delete(
  "remove/:id",
  validate({ params: validationScheme.deleteRewardSchemeRule }),
  RewardScheme.remove
)
/**
 * @api {post} /reward-service/dispatch
 * @apiName DispatchReward- Dispatach a reward
 * @apiGroup Reward
 * @apiVersion 1.0.0
 * @apiDescription This endpoint will check dispatch criteria and dispatch the
 *                  reward accordingly or return error.
 * @apiParamExample {json} Request Example:
 *     {
 *          "user" : {
 *              "id" : "userMongoId",
 *              "level" : "Retailer",
 *              "context" : "Context of the user"
 *          },
 *          "product": {
 *              "id" : "productInventoryMongoId",
 *              "skuCode"   : "SKucodeof prodcut"
 *          },
 *          "scanuuid" : "UniqueScanCode"
 *      }
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *      "success" : true,
 *      "message" : "Reward Dispatched Successfully"
 *      "data":{
 *              "_id" : ObjectId("mongoId"),
 *              "rewardCode" : "UniqueRewardCode",
 *              "scanuuid" : "UniqueScanCode"
 *              "reward" : "RewardDetails",
 *              "points" : 10,
 *              "approved": true
 *          }
 *     }
 *
 * @apiErrorExample {json} Error-Response
 *      HTTP/1.1 200 OK
 *      {
 *          "success" : false,
 *          "message" : "Unable To dispatch reward"
 *          "error" : {
 *              "code" : "ERR_PRODUCT_CODE",
 *              "message" : "A reward fro this has already been dispatched"
 *          }
 *      }
 *
 */
rewardRouter.post(
  "rewards/dispatch",
  validate({ body: validationScheme.dispatchRewardRule }),
  dispatchRewards
)

rewardRouter.post(
  "rewards/get",
  validate({ body: validationScheme.getRewardRule }),
  getRewards
)

rewardRouter.post(
  "approve",
  validate({ body: validationScheme.approveRewardRule }),
  RewardRedeem.approve
)

rewardRouter.post(
  "reject",
  validate({ body: validationScheme.rejectRewardRule }),
  RewardRedeem.reject
)

rewardRouter.get("get-pending", RewardRedeem.getPending)
rewardRouter.get("get-approved", RewardRedeem.getApproved)

rewardRouter.post(
  "rewards/redeemed-for",
  validate({ body: validationScheme.getReedemRewardsRule }),
  RewardRedeem.getReedemRewardsFor
)

rewardRouter.post(
  "rewards/redeemed-by",
  validate({ body: validationScheme.getReedemRewardsRule }),
  RewardRedeem.getReedemRewardsBy
)

rewardRouter.post(
  "redeem",
  validate({ body: validationScheme.redeemRewardRule }),
  RewardRedeem.redeem
)

rewardRouter.post(
  "redeem-inkind",
  validate({ body: validationScheme.redeemInKindRewardRule }),
  RewardRedeem.inkind
)
