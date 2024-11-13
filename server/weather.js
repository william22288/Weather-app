import * as dotenv from "dotenv";

dotenv.config();

const OPEN_WEATHER_API_KEY = process.env.OPEN_WEATHER_API_KEY;

export async function getCurrentWeather(lat, lon) {

    const weatherRes = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${OPEN_WEATHER_API_KEY}`);

    //parse the response as JSON
    const weatherData = await weatherRes.json();

    const airQualityRes = await fetch(`https://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${OPEN_WEATHER_API_KEY}`);
    const airQualityData = await airQualityRes.json();

    return {
        city: weatherData.name,
        icon: `https://openweathermap.org/img/wn/${weatherData.weather[0].icon}@4x.png`,
        description: weatherData.weather[0].description,
        currentTemp: Math.round(weatherData.main.temp),
        minTemp: Math.trunc(weatherData.main.temp_min),
        maxTemp: Math.trunc(weatherData.main.temp_max),
        airQuality: airQualityData.list[0].main.aqi // Air Quality Index (AQI)
    }
}



