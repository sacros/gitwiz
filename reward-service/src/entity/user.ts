/**
 * @returns {userLevel} numerical level of user
 */
enum userLevel {
  MANUFACTURER = 0,
  WAREHOUSE = 1,
  STOCKIST = 2,
  DISTRIBUTOR = 3,
  RETAILER = 4,
  CONTRACTOR = 4.1,
  CONSUMER = 5,
  SALES = 5
}
/**
 * @returns {level} user type of sales
 */
enum level {
  SALES = "SALES",
  MANUFACTURER = "MANUFACTURER",
  WAREHOUSE = "WAREHOUSE",
  STOCKIST = "STOCKIST",
  DISTRIBUTOR = "DISTRIBUTOR",
  RETAILER = "RETAILER",
  CONTRACTOR = "CONTRACTOR",
  CONSUMER = "CONSUMER"
}
/**
 * @interface IUser
 */
interface IUser {
  id: string
  level: number
  context: string
}

export { userLevel, level, IUser }
