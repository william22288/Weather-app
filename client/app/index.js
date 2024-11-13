//import * as dotenv from 'dotenv';
//import fetch from "node-fetch";

// dotenv.config();

// const OPEN_WEATHER_API_KEYY = process.env.OPEN_WEATHER_API_KEY;
const OPEN_WEATHER_API_KEY = '6bd59e6ef36302caf6be16d063f551c6'
const OPEN_CAGE_API_KEY = '7be37d572b1a4df9bbb24dee3f27c3d6';
// import { getFiveDayForecast } from '../server/weather.js';



function getLocation() {

    // check if geoLocation features are available
    if (navigator.geolocation) {
        // prompt user to allow location access
        navigator.geolocation.getCurrentPosition((position) =>{
            // extract the coordinates from the user's position
            const { latitude, longitude} = position.coords;

            // using the coordinates, send a request to our server
            getWeather(latitude, longitude).catch((err) => {
                   alert("Unable to get weather data");
                    console.error(`Error getting weather data`, err);
                })
        });
    } else{
        alert("Geolocation is not supported by this browser.");
    }
}

async function getFiveDayForecast(city, unit='metric') {
    const res = await fetch(`https://api.openweathermap.org/data/2.5/forecast?q=${city}&units=${unit}&appid=${OPEN_WEATHER_API_KEY}`);
    const data = await res.json();

    // Filter the data to get one forecast per day
    const dailyForecasts = [];
    const dates = new Set();

    for (const item of data.list) {
        const date = item.dt_txt.split(' ')[0]; // Get the date part only
        if (!dates.has(date)) {
            dates.add(date);
            dailyForecasts.push({
                date: item.dt_txt,
                icon: `https://openweathermap.org/img/wn/${item.weather[0].icon}@2x.png`,
                description: item.weather[0].description,
                temp: Math.round(item.main.temp),
            });
        }
        if (dailyForecasts.length === 5) break; // Stop after getting 5 days
    }

    return dailyForecasts;
}

async function getCoordinates(city, state) {
    const geocodeRes = await fetch(`https://api.opencagedata.com/geocode/v1/json?q=${city},${state}&key=${OPEN_CAGE_API_KEY}`);
    const geocodeData = await geocodeRes.json();
    const { lat, lng } = geocodeData.results[0].geometry;
    return { lat, lon: lng };
}

async function getWeather(lat, lon) {
    const res = await fetch('/api/current-weather', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ lat, lon})
        
    });

    const {city, icon, description, currentTemp, minTemp, maxTemp, unit} = await res.json();

    const airQualityResponse = await fetch(`https://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${OPEN_WEATHER_API_KEY}`);
    const airQualityData = await airQualityResponse.json();

    const forecastData = await getFiveDayForecast(city);
    //console.log('Forecast Data:', forecastData); // Add this line to log the forecast data

    updateForecastUI(forecastData, 'metric');

    // if the response is not ok, alert the user
    if (!res.ok) {
        console.log(res);
        alert("An error occurred while getting the weather.");
        return;
    }

    //otherwise, hide loader and display weather data
    const loaderElement = document.getElementById('loader');
    loaderElement.classList.add('hidden');

    const containerElement = document.getElementById('container');
    containerElement.classList.remove('hidden');

    const cityElement = document.getElementById('city');
    cityElement.innerHTML = city;

    const iconElement = document.getElementById('icon');
    iconElement.src = icon;

    const descriptionElement = document.getElementById('description');
    descriptionElement.innerHTML = description;

    const currentTempElement = document.getElementById('currentTemp');
    currentTempElement.innerHTML = `${currentTemp}°C`;

    const minTempElement = document.getElementById('minTemp');
    minTempElement.innerHTML = `${minTemp}°C`;

    const maxTempElement = document.getElementById('maxTemp');
    maxTempElement.innerHTML = `${maxTemp}°C`;

    const airQualityElement = document.getElementById('airQuality');
    airQualityElement.innerHTML = `Air Quality Index: ${airQualityData.list[0].main.aqi}`;
}

document.getElementById('locationForm').addEventListener('submit', async function(event) {
    event.preventDefault();

    const city = document.getElementById('cityInput').value;
    const state = document.getElementById('stateInput').value;
    const unit = document.getElementById('unitToggle').value;


    const loaderElement = document.getElementById('loader');
    loaderElement.classList.remove('hidden');

    const containerElement = document.getElementById('container');
    containerElement.classList.add('hidden');

    try {
        // Get coordinates from city and state
        const { lat, lon } = await getCoordinates(city, state);
        const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city},${state}&units=${unit}&appid=${OPEN_WEATHER_API_KEY}`);
        const data = await response.json();

        const airQualityResponse = await fetch(`https://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${OPEN_WEATHER_API_KEY}`);
        const airQualityData = await airQualityResponse.json();

        const weatherData = {
            city: data.name,
            icon: `https://openweathermap.org/img/wn/${data.weather[0].icon}@4x.png`,
            description: data.weather[0].description,
            currentTemp: Math.round(data.main.temp),
            minTemp: Math.trunc(data.main.temp_min),
            maxTemp: Math.trunc(data.main.temp_max),
            unit: unit === 'metric' ? '°C' : '°F',
            airQuality: airQualityData.list[0].main.aqi // Air Quality Index (AQI)

        };

        updateUI(weatherData);
    } catch (error) {
        console.error('Error fetching weather data:', error);
    } finally {
        loaderElement.classList.add('hidden');
    }
});

function updateForecastUI(forecastData, unit) {
    const forecastContainer = document.getElementById('forecastContainer');
    forecastContainer.innerHTML = '';
    const unitSymbol = unit === 'metric' ? '°C' : '°F';


    forecastData.forEach(day => {
        const forecastElement = document.createElement('div');
        forecastElement.classList.add('flex', 'flex-col', 'items-center', 'space-y-2', 'p-4', 'rounded-lg', 'shadow-md');

        // Determine the background and border colors based on the temperature
        let bgColor, borderColor;
        if (day.temp < 0) {
            bgColor = 'bg-blue-500';
            borderColor = 'border-blue-700';
        } else if (day.temp < 10) {
            bgColor = 'bg-cyan-500';
            borderColor = 'border-cyan-700';
        } else if (day.temp < 20) {
            bgColor = 'bg-yellow-500';
            borderColor = 'border-yellow-700';
        } else if (day.temp < 30) {
            bgColor = 'bg-orange-500';
            borderColor = 'border-orange-700';
        } else {
            bgColor = 'bg-red-500';
            borderColor = 'border-red-700';
        }

        forecastElement.classList.add(bgColor, borderColor, 'border-2');

        forecastElement.innerHTML = `
            <h3 class="text-sm font-semibold text-indigo-900">${new Date(day.date).toLocaleDateString()}</h3>
            <img src="${day.icon}" alt="Weather Icon" class="h-12 w-12">
            <p class="text-sm text-indigo-500">${day.description}</p>
            <p class="text-lg font-bold text-indigo-900">${day.temp}${unitSymbol}</p>
        `;

        forecastContainer.appendChild(forecastElement);
    });
}


function updateUI({ city, icon, description, currentTemp, minTemp, maxTemp, unit, airQuality }) {
    const containerElement = document.getElementById('container');
    containerElement.classList.remove('hidden');

    const cityElement = document.getElementById('city');
    cityElement.innerHTML = city;

    const iconElement = document.getElementById('icon');
    iconElement.src = icon;

    const descriptionElement = document.getElementById('description');
    descriptionElement.innerHTML = description;

    const currentTempElement = document.getElementById('currentTemp');
    currentTempElement.innerHTML = `${currentTemp}${unit}`;

    const minTempElement = document.getElementById('minTemp');
    minTempElement.innerHTML = `${minTemp}${unit}`;

    const maxTempElement = document.getElementById('maxTemp');
    maxTempElement.innerHTML = `${maxTemp}${unit}`;

    const airQualityElement = document.getElementById('airQuality');
    airQualityElement.innerHTML = `Air Quality Index: ${airQuality}`;
}


document.getElementById('locationForm').addEventListener('submit', async function(event) {
    event.preventDefault();

    const city = document.getElementById('cityInput').value;
    const state = document.getElementById('stateInput').value;
    const unit = document.getElementById('unitToggle').value;

    const loaderElement = document.getElementById('loader');
    loaderElement.classList.remove('hidden');

    const containerElement = document.getElementById('container');
    containerElement.classList.add('hidden');

    const forecastData = await getFiveDayForecast(city, unit);
    //console.log('Forecast Data:', forecastData); // Add this line to log the forecast data

    updateForecastUI(forecastData,unit);

    //const weatherData = await getCurrentWeather(city, state);
    //updateUI(weatherData);

    

    // try {
    //     const weatherData = await getCurrentWeather(city, state);
    //     updateUI(weatherData);

    //     const forecastData = await getFiveDayForecast(city, state);
    //     console.log('Forecast Data:', forecastData); // Add this line to log the forecast data

    //     updateForecastUI(forecastData);
    // } catch (error) {
    //     console.error('Error fetching weather data:', error);
    // } finally {
    //     loaderElement.classList.add('hidden');
    // }
});


 
window.onload = getLocation;