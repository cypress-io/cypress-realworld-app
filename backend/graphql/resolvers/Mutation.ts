import { createBankAccountForUser, removeBankAccountById } from "../../database";
import { isDemoBreak } from "../../demoBreak";

const Mutation = {
  createBankAccount: (obj: any, args: any, ctx: any) => {
    // DEMO BREAK: GraphQL bank account create succeeds only ~30% of the time
    if (isDemoBreak() && Math.random() >= 0.3) {
      throw new Error("Simulated GraphQL createBankAccount failure (DEMO_BREAK)");
    }

    return createBankAccountForUser(ctx.user.id, args);
  },
  deleteBankAccount: (obj: any, args: any, ctx: any) => {
    removeBankAccountById(args.id);
    return true;
  },
};

export default Mutation;
