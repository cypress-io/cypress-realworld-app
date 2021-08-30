import { getBankAccountsByUserId } from "../../database";

const Query = {
  listBankAccount(obj: any, args: any, ctx: any) {
    /* istanbul ignore next */
    try {
      const accounts = getBankAccountsByUserId(ctx.user.id!);

      return accounts;
      /* istanbul ignore next */
    } catch (err: any) {
      /* istanbul ignore next */
      throw new Error(err);
    }
  },
};

export default Query;
