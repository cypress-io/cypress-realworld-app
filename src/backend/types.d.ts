// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { User as IUser } from "../models/user";

declare global {
  namespace Express {
    interface User extends IUser {}
  }
}
