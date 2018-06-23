require('dotenv').config()

const DarkSky = require('dark-sky')
const darksky = new DarkSky(process.env.DARK_SKY_KEY)

const Pushover = require( 'pushover-notifications' )
const pushover = new Pushover({
  user: process.env.PUSHOVER_USER,
  token: process.env.PUSHOVER_TOKEN,
})

function getWeatherResponse(response) {
  return response.daily.data;
}

function summarise(days) {
  return {
    length: days.length,
    precipIntensityMax: days.reduce((currentMax, day) => Math.max(day.precipIntensityMax, currentMax), 0),
    precipIntensity: days.reduce((currentTotal, day) => currentTotal + day.precipIntensity, 0),
    precipProbabilityMax: days.reduce((currentMax, day) => Math.max(day.precipProbability, currentMax), 0),
    apparentTemperatureLowAvg: days.reduce((currentTotal, day) => currentTotal + day.apparentTemperatureLow, 0) / days.length,
    apparentTemperatureHighAvg: days.reduce((currentTotal, day) => currentTotal + day.apparentTemperatureHigh, 0) / days.length,
  }
}

const THRESHOLD = 0.05
function sendPushNotification(weatherDays) {
  let daysWithoutRain;
  for (daysWithoutRain = 0; daysWithoutRain < weatherDays.length; daysWithoutRain++) {
    const day = weatherDays[daysWithoutRain];
    if (day.precipProbability > THRESHOLD) {
      break;
    }
  }

  if (daysWithoutRain < 3) {
    return console.info(`Less than three days without rain (${daysWithoutRain})`);
  }

  const rainFreeDays = weatherDays.slice(0, daysWithoutRain);
  const weatherSummary = summarise(rainFreeDays);
  const message = `${weatherSummary.precipIntensityMax.toFixed(1)}mm`
    + ` with an avg high of ${weatherSummary.apparentTemperatureHighAvg.toFixed(0)}°C`
    + ` and low of ${weatherSummary.apparentTemperatureLowAvg.toFixed(0)}°C.`

  const msg = {
    message,
    title: `No Rain Forecast for Next ${daysWithoutRain} days`,
    sound: 'falling',
    priority: 0,
  }

  console.log("Sending", msg);

  return pushover.send(msg, function(err, result) {
    if (err) {
      throw err
    }

    console.log(result);
  })
}

darksky
    .latitude(process.env.LAT)
    .longitude(process.env.LON)
    .units('si')
    .language('en')
    .exclude('currently,minutely,hourly,alerts,flags')
    .extendHourly(false)
    .get()
    .then(getWeatherResponse)
    .then(sendPushNotification)
    .catch(console.error)
