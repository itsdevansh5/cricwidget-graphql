const fetch = require("node-fetch");

module.exports = {
  Query: {
    async news(_, { query }, context) {
      const url = `https://newsapi.org/v2/everything?q=${encodeURIComponent(query)}&apiKey=${context.NEWSAPI_KEY}`;
      const res = await fetch(url);
      const data = await res.json();

      return data.articles?.map(article => ({
        title: article.title,
        url: article.url,
        source: article.source.name,
        publishedAt: article.publishedAt,
      })) || [];
    }
  }
};
