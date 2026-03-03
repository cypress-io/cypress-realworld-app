if (!process.env.SEED_DEFAULT_USER_PASSWORD) {
  throw new Error("SEED_DEFAULT_USER_PASSWORD is not defined");
}

export const PASSWORD = process.env.SEED_DEFAULT_USER_PASSWORD;

export type UserData = {
  firstName: string;
  lastName: string;
  username: string;
  password: string;
};

export const defaultUserData: UserData = {
  firstName: "Bob",
  lastName: "Ross",
  username: "PainterJoy90",
  password: PASSWORD,
};
