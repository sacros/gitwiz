// import { main } from "./main"
// import * as chai from "chai"
// import * as request from "supertest"
// import { resolve } from "path"
// import * as uuid from "uuid"
// import { logger } from "../logger/logger"
// import { exec } from "child_process"
// /**
//  * Don't delete these constants
//  */
// const should = chai.should()
// const expect = chai.expect
// const assert = chai.assert

// let rewardCode: any
// let server
// before(async () => {
//   server = await main()
// })
// after(async () => {
//   await server.close()
//   exec(`pkill --signal 1 IntegrationTest`)
// })

// const createRewardScheme = {
//   skuCode: "test-sku",
//   points: 2,
//   conversionRatio: 1,
//   conversionUnit: "INR",
//   startDate: 1564572231,
//   endDate: 1864572231,
//   provider: "ITC",
//   dispatchToLevel: 4,
//   scheme: {
//     type: "propagating",
//     termination: 2
//   }
// }

// const err = {
//   success: false,
//   error: {
//     errorCode: "ERR_SCHEME_EXISTS",
//     errorMessage: "The scheme already exists"
//   }
// }

// describe("Reward Schemes Service", () => {
//   describe("GET /reward-service/get", () => {
//     it("get response with success = true and body as list", () => {
//       return request(server)
//         .get("/reward-service/get")
//         .set("Accept", "application/json")
//         .expect("Content-Type", /json/)
//         .expect(200)
//         .expect(res => {
//           res.body.should.have.property("success", true)
//           res.body.success.should.be.a("boolean")
//           res.body.data.should.be.a("array")
//           return res
//         })
//     })
//   })
//   describe("POST /reward-service/create", () => {
//     it("get response with success = true and body as list", () => {
//       return request(server)
//         .post("/reward-service/create")
//         .set("Accept", "application/json")
//         .send(createRewardScheme)
//         .expect("Content-Type", /json/)
//         .expect(201)
//         .expect(res => {
//           res.body.should.have.property("message", "Successfully created")
//           res.body.should.have.property("success", true)
//           res.body.success.should.be.a("boolean")
//           res.body.data.should.be.a("array")
//           return res
//         })
//     })
//     it("should return error if reward scheme created again", () => {
//       return request(server)
//         .post("/reward-service/create")
//         .set("Accept", "application/json")
//         .send(createRewardScheme)
//         .expect("Content-Type", /json/)
//         .expect(409)
//         .expect(err)
//     })
//   })
// })

// describe("Reward Dispatch Service", () => {
//   describe("POST /reward/dispatch", () => {
//     it("Should return disptached", () => {
//       /**
//        * Input
//        */
//       const dispatchReward = {
//         user: {
//           id: "merajahmadsiddiqui",
//           level: 4,
//           context: "test-user-context"
//         },
//         product: {
//           id: "test-product",
//           skuCode: "test-sku"
//         },
//         scanuuid: uuid.v4()
//       }
//       /**
//        * Expected Output
//        */

//       return request(server)
//         .post("/reward-service/rewards/dispatch")
//         .send(dispatchReward)
//         .set("Accept", "application/json")
//         .expect("Content-Type", /json/)
//         .expect(200)
//         .expect(res => {
//           res.body.should.have.property("success", true)
//           rewardCode = [res.body.data.rewardCode]
//         })
//     })

//     it("Should return scheme does not exist", () => {
//       /**
//        * Input
//        */
//       const dispatchReward = {
//         user: {
//           id: "testusernewuser",
//           level: 4,
//           context: "test-user-context"
//         },
//         product: {
//           id: "14kjsdhfjkhkjg",
//           skuCode: "test-sku-2"
//         },
//         scanuuid: uuid.v4()
//       }
//       /**
//        * Expected Output
//        */
//       const dispatchOutput = {
//         success: false,
//         error: {
//           errorCode: "SCHEME_NOT_EXIST",
//           errorMessage: "No such reward scheme found"
//         }
//       }
//       return request(server)
//         .post("/reward-service/rewards/dispatch")
//         .send(dispatchReward)
//         .set("Accept", "application/json")
//         .expect("Content-Type", /json/)
//         .expect(404, dispatchOutput)
//     })

//     it("Should return product already used", () => {
//       /**
//        * Input
//        */
//       const dispatchReward = {
//         user: {
//           id: "test-user",
//           level: 4,
//           context: "test-user-context"
//         },
//         product: {
//           id: "test-product",
//           skuCode: "test-sku"
//         },
//         scanuuid: uuid.v4()
//       }
//       /**
//        * Expected Output
//        */
//       const dispatchOutput = {
//         success: false,
//         error: {
//           errorCode: "PRODUCT_EXIST",
//           errorMessage: "This product has already been used for reward"
//         }
//       }
//       return request(server)
//         .post("/reward-service/rewards/dispatch")
//         .send(dispatchReward)
//         .set("Accept", "application/json")
//         .expect("Content-Type", /json/)
//         .expect(409, dispatchOutput)
//     })
//   })
// })

// describe("Reward Redeem Service", () => {
//   describe("POST /redeem", () => {
//     it("Should return reward claim error", () => {
//       /**
//        * Input
//        */
//       const redeemInput = {
//         rewardCodes: [
//           "RC-9FDFE",
//           "RC-5851D",
//           "RC-FF704",
//           "RC-020BE",
//           "RC-C457D"
//         ],
//         user: {
//           id: "someid",
//           level: 1,
//           context: "something"
//         }
//       }
//       /**
//        * Expected Output
//        */
//       const redeemOuput = {
//         success: false,
//         error: {
//           errorCode: "REWARD_CLAIM",
//           errorMessage:
//             "The provided reward code is not claimable or is claimed"
//         }
//       }
//       return request(server)
//         .post("/reward-service/redeem")
//         .send(redeemInput)
//         .set("Accept", "application/json")
//         .expect("Content-Type", /json/)
//         .expect(409, redeemOuput)
//     })

//     it("Should Return REWARD_CLAIM ", () => {
//       /**
//        * Input
//        */
//       const redeemInput = {
//         rewardCodes: rewardCode,
//         user: {
//           id: "test-redeem-user",
//           level: 5,
//           context: "test-redeem-context"
//         }
//       }
//       const redeemOutput = {
//         success: false,
//         error: {
//           errorCode: "INVALID_USER",
//           errorMessage: "The user is not authorized to redeem this reward"
//         }
//       }
//       return request(server)
//         .post("/reward-service/redeem")
//         .send(redeemInput)
//         .set("Accept", "application/json")
//         .expect("Content-Type", /json/)
//         .expect(403, redeemOutput)
//     })

//     it("Should Return success redeem", () => {
//       /**
//        * Input
//        */
//       const redeemInput = {
//         rewardCodes: rewardCode,
//         user: {
//           id: "test-redeem-user",
//           level: 3,
//           context: "test-redeem-context"
//         }
//       }
//       return request(server)
//         .post("/reward-service/redeem")
//         .send(redeemInput)
//         .set("Accept", "application/json")
//         .expect("Content-Type", /json/)
//         .expect(200)
//         .expect(res => {
//           res.body.should.have.property("success", true)
//         })
//     })
//   })
// })
