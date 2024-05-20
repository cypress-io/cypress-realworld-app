import { createBankAccountForUser, removeBankAccountById } from "../../database";

const Mutation = {
  createBankAccount: (obj: any, args: any, ctx: any) => {
    return createBankAccountForUser(ctx.user.id, args);
  },
  deleteBankAccount: (obj: any, args: any, ctx: any) => {
    removeBankAccountById(args.id);
    return true;
  },
};

export default Mutation;
