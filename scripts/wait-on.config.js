require("dotenv").config();

module.exports = {
  resources: [
    `http://localhost:${process.env.PORT}`,
    `http://localhost:${process.env.VITE_BACKEND_PORT}`,
  ],
  timeout: 60000,
};
