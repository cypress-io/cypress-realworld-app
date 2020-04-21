// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { User as IUser } from "../src/models/user";

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface User extends IUser {}
  }
}
