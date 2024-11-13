import express from 'express'
import * as path from 'path'
import bodyParser from 'body-parser'
import fetch from 'node-fetch'
import * as dotenv from 'dotenv'
import { getCurrentWeather } from './weather.js'

// load environment variables from .env file
dotenv.config();

// initialize express app
export const app = express()

// parse application/json request bodies
app.use(bodyParser.json())

// serve static files from client folder (js, css, images, etc.)
app.use(express.static(path.join(process.cwd(), 'client')))

app.post('/api/current-weather', async (req,res)=>{
    const { lat, lon } = req.body;
    const { city, icon, description, currentTemp, minTemp, maxTemp, airQuality} = await getCurrentWeather(lat, lon);

    return res.json({
        city,
        icon,
        description,
        currentTemp,
        minTemp,
        maxTemp,
        airQuality
    })
})

// set the port to listen on
// which is either the port specified in the .env
// or 3000 if no port is specified
const PORT = process.env.PORT || 3000;

// start the express server
app.listen(PORT, () => console.log(`Server listening on localhost:${PORT}`));

