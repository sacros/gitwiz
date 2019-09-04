import { PAGINATION_LIMIT } from "../constants"
import * as util from "util"
export const paginate = async (collection, page, match) => {
  const data = await collection
    .aggregate([
      { $match: match },
      { $skip: PAGINATION_LIMIT * (page - 1) },
      { $limit: PAGINATION_LIMIT }
    ])
    .toArray()
  const result = {
    data: data,
    pagination: {
      currentPage: page,
      pageLimit: PAGINATION_LIMIT
    }
  }
  return result
}
