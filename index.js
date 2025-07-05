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

async function startServer() {
  const app = express();
  const server = new ApolloServer({ typeDefs, resolvers });

  await server.start();

  // 💡 Fix: split into individual middleware lines
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

  const PORT = 4000;
  app.listen(PORT, () => {
    console.log(`🚀 Server ready at http://localhost:${PORT}/`);
  });
}

startServer().catch((err) => {
  console.error("❌ Error starting server:", err);
});
