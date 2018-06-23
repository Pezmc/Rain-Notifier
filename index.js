require('dotenv').config()

const DarkSky = require('dark-sky')
const darksky = new DarkSky(process.env.DARK_SKY_KEY)

const Pushover = require( 'pushover-notifications' )
const pushover = new Pushover({
  user: process.env.PUSHOVER_USER,
  token: process.env.PUSHOVER_TOKEN,
})

function summarizeWeatherResponse(response) {
  const days = response.daily.data

  const days3 = summarise(days.slice(0, 3))
  const days5 = summarise(days.slice(0, 5))
  const days7 = summarise(days.slice(0, 7))

  return [days3, days5, days7]
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
function sendPushNotification(weatherSummary) {
  const [days3, days5, days7] = weatherSummary

  let daysWithoutRain;
  if (days7.precipProbabilityMax <= THRESHOLD) {
    daysWithoutRain = days7
  } else if (days5.precipProbabilityMax <= THRESHOLD) {
    daysWithoutRain = days5
  } else if (days3.precipProbabilityMax <= THRESHOLD) {
    daysWithoutRain = days3
  }

  if (!daysWithoutRain) {
    return console.info("Less than three days without rain");
  }

  const days = daysWithoutRain;
  const message = `${days.precipIntensityMax.toFixed(1)}mm with an avg high of ${days.apparentTemperatureHighAvg.toFixed(0)}°C and low of ${days.apparentTemperatureLowAvg.toFixed(0)}°C.`

  const msg = {
    message,
    title: `No Rain Forecast for Next ${days.length} days`,
    sound: 'falling',
    priority: 0
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
    .then(summarizeWeatherResponse)
    .then(sendPushNotification)
    .catch(console.error)
