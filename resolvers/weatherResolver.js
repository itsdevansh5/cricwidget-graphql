const fetch = require("node-fetch");

module.exports = {
  Query: {
    async weather(_, { city }, context) {
      const geoUrl = `http://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(city)}&limit=1&appid=${context.OPENWEATHER_KEY}`;
      const geoRes = await fetch(geoUrl);
      const geoData = await geoRes.json();
      if (!geoData || geoData.length === 0) return null;

      const { lat, lon } = geoData[0];

      const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${context.OPENWEATHER_KEY}&units=metric`;
      const weatherRes = await fetch(weatherUrl);
      const weatherData = await weatherRes.json();

      return {
        city,
        temperature: weatherData.main.temp,
        description: weatherData.weather[0].description,
      };
    }
  }
};
