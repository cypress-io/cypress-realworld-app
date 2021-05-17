import { createBankAccountForUser, removeBankAccountById } from "../../database";

const Mutation = {
  CreateBankAccount: (obj: any, args: any, ctx: any) => {
    const account = createBankAccountForUser(ctx.user.id!, args);
    return account;
  },
  deleteBankAccount: (obj: any, args: any, ctx: any) => {
    removeBankAccountById(args.id);
    return true;
  },
};

export default Mutation;
