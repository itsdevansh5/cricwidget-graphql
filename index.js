console.log("🚧 Starting GraphQL server...");

const express = require("express");
const { ApolloServer } = require("@apollo/server");
const { expressMiddleware } = require("@apollo/server/express4");
const { readFileSync } = require("fs");
const cors = require("cors");
const dotenv = require("dotenv");

// Load env variables
dotenv.config();

// Import resolvers
const matchResolver = require("./resolvers/matchResolver");
const weatherResolver = require("./resolvers/weatherResolver");
const newsResolver = require("./resolvers/newsResolver");

// Load GraphQL schema
const typeDefs = readFileSync("./schema.graphql", { encoding: "utf-8" });

// Combine resolvers
const resolvers = {
  Query: {
    ...matchResolver.Query,
    ...weatherResolver.Query,
    ...newsResolver.Query,
  },
};

// Export a handler for Vercel
module.exports = async (req, res) => {
  const app = express();

  const server = new ApolloServer({
    typeDefs,
    resolvers,
  });

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

  return app(req, res); // 🚨 Key: forward the request to express app
};
