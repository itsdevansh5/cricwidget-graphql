const fetch = require("node-fetch");

async function getWeather(city, apiKey) {
  const geoUrl = `http://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(city)}&limit=1&appid=${apiKey}`;
  const geoRes = await fetch(geoUrl);
  const geoData = await geoRes.json();
  if (!geoData || geoData.length === 0) return null;

  const { lat, lon } = geoData[0];

  const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`;
  const weatherRes = await fetch(weatherUrl);
  const weatherData = await weatherRes.json();

  return {
    city,
    temperature: weatherData.main.temp,
    description: weatherData.weather[0].description,
  };
}

const resolvers = {
  Query: {
    // Called ONLY when frontend clicks to load match dropdown
    async liveMatches(_, __, context) {
      const res = await fetch(`https://api.cricapi.com/v1/currentMatches?apikey=${context.CRICAPI_KEY}`);
      const data = await res.json();
      return data.data?.map(match => ({
        id: match.id,
        name: match.name,
        status: match.status,
        score: match.score?.map(s => ({
          inning: s.inning,
          r: s.r,
          w: s.w,
          o: s.o,
        })),
      })) || [];
    },

    // Called when a specific match is selected
    async match(_, { matchId }, context) {
      const res = await fetch(`https://api.cricapi.com/v1/match_info?apikey=${context.CRICAPI_KEY}&id=${matchId}`);
      const data = await res.json();
      const match = data.data;

      const cityGuess = match.name.split(" vs ")[0].trim();
      let weather = null;
      try {
        weather = await getWeather(cityGuess, context.OPENWEATHER_KEY);
      } catch (err) {
        console.error("Weather API error:", err);
      }

      return {
        id: match.id,
        name: match.name,
        status: match.status,
        score: match.score?.map(s => ({
          inning: s.inning,
          r: s.r,
          w: s.w,
          o: s.o,
        })),
        weather,
      };
    }
  }
};

module.exports = resolvers;
