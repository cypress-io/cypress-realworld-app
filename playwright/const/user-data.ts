if (!process.env.SEED_DEFAULT_USER_PASSWORD) {
  throw new Error("SEED_DEFAULT_USER_PASSWORD is not defined");
}

export const PASSWORD = process.env.SEED_DEFAULT_USER_PASSWORD;

export const UserData = {
  firstName: "Bob",
  lastName: "Ross",
  username: "PainterJoy90",
  password: PASSWORD,
};
