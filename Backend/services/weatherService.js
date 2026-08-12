const axios = require("axios");

const getWeather = async (latitude, longitude) => {
  if (!process.env.WEATHER_API_KEY) {
    throw new Error("WEATHER_API_KEY is not configured");
  }

  const response = await axios.get(
    "https://api.openweathermap.org/data/2.5/weather",
    {
      params: {
        lat: latitude,
        lon: longitude,
        appid: process.env.WEATHER_API_KEY,
        units: "metric",
      },
    }
  );

  return response.data;
};

module.exports = {
  getWeather,
};