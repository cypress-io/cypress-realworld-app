import { getBankAccountsByUserId } from "../../database";

const Query = {
  listBankAccount(obj: any, args: any, ctx: any) {
    try {
      const accounts = getBankAccountsByUserId(ctx.user.id!);

      return accounts;
    } catch (err) {
      throw new Error(err);
    }
  },
};

export default Query;
