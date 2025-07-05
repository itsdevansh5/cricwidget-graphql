const express = require("express");
const { ApolloServer } = require("@apollo/server");
const { expressMiddleware } = require("@apollo/server/express4");
const { readFileSync } = require("fs");
const cors = require("cors");
const dotenv = require("dotenv");

dotenv.config();

const matchResolver = require("./resolvers/matchResolver");
const weatherResolver = require("./resolvers/weatherResolver");
const newsResolver = require("./resolvers/newsResolver");

const typeDefs = readFileSync("./schema.graphql", { encoding: "utf-8" });

const resolvers = {
  Query: {
    ...matchResolver.Query,
    ...weatherResolver.Query,
    ...newsResolver.Query,
  },
};

module.exports = async (req, res) => {
  const app = express();
  const server = new ApolloServer({ typeDefs, resolvers });
  await server.start();

  app.use(cors());
  app.use(express.json());

  app.use(
    "/",
    expressMiddleware(server, {
      context: async () => ({
        CRICAPI_KEY: process.env.CRICAPI_KEY,
        OPENWEATHER_KEY: process.env.OPENWEATHER_KEY,
        NEWSAPI_KEY: process.env.NEWSAPI_KEY,
      }),
    })
  );

  return app(req, res); // 💡 Important: this replaces app.listen()
};
