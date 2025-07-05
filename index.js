const express = require("express");
const { ApolloServer } = require("@apollo/server");
const { expressMiddleware } = require("@apollo/server/express4");
const { readFileSync } = require("fs");
const path = require("path");
const cors = require("cors");
const dotenv = require("dotenv");

dotenv.config();

console.log("🚧 Server initializing...");

// Import resolvers (with fallback logging)
let matchResolver = {}, weatherResolver = {}, newsResolver = {};
try {
  matchResolver = require("./resolvers/matchResolver");
  weatherResolver = require("./resolvers/weatherResolver");
  newsResolver = require("./resolvers/newsResolver");
  console.log("✅ Resolvers loaded");
} catch (err) {
  console.error("❌ Error loading resolvers:", err);
}

let typeDefs = "";
try {
  typeDefs = readFileSync(path.join(__dirname, "schema.graphql"), "utf-8");
  console.log("✅ Schema loaded");
} catch (err) {
  console.error("❌ Error loading schema.graphql:", err);
}

const resolvers = {
  Query: {
    ...matchResolver.Query,
    ...weatherResolver.Query,
    ...newsResolver.Query,
  },
};

module.exports = async (req, res) => {
  try {
    const app = express();

    const server = new ApolloServer({ typeDefs, resolvers });
    await server.start();
    console.log("✅ Apollo Server started");

    app.use(cors());
    app.use(express.json());

    app.use(
      "/",
      expressMiddleware(server, {
        context: async () => {
          console.log("⚙️ Context loading...");
          return {
            CRICAPI_KEY: process.env.CRICAPI_KEY || "undefined",
            OPENWEATHER_KEY: process.env.OPENWEATHER_KEY || "undefined",
            NEWSAPI_KEY: process.env.NEWSAPI_KEY || "undefined",
          };
        },
      })
    );

    console.log("🚀 Sending to express app...");
    return app(req, res);
  } catch (err) {
    console.error("❌ Server crashed:", err);
    res.statusCode = 500;
    res.end("Internal server error");
  }
};
