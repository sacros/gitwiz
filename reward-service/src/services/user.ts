import { IUser } from "../entity/user"
class UserService {
  /**
   * @param {IUser} user
   * @returns {boolean} whether user is approved to get reward or not
   */
  protected isUserAffiliated = async (user: IUser) => {
    return true
  }
}

export { UserService }
