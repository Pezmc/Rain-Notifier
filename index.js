require('dotenv').config()

const DarkSky = require('dark-sky')
const darksky = new DarkSky(process.env.DARK_SKY_KEY)

function handleWeatherResponse(response) {
  const days = response.daily.data

  const days3 = summarise(days.slice(0, 3));
  const days5 = summarise(days.slice(0, 5));
  const days7 = summarise(days.slice(0, 7))
}

function summarise(days) {
  return {
    precipIntensityMax: days.reduce((currentMax, day) => Math.max(day.precipIntensityMax, currentMax), 0),
    precipIntensity: days.reduce((currentTotal, day) => currentTotal + day.precipIntensity, 0),
    precipProbabilityMax: days.reduce((currentMax, day) => Math.max(day.precipProbability, currentMax), 0),
    apparentTemperatureLowAvg: days.reduce((currentTotal, day) => currentTotal + day.apparentTemperatureLow, 0) / days.length,
    apparentTemperatureHighAvg: days.reduce((currentTotal, day) => currentTotal + day.apparentTemperatureHigh, 0) / days.length,
  }
}

darksky
    .latitude(process.env.LAT)
    .longitude(process.env.LON)
    .units('si')
    .language('en')
    .exclude('currently,minutely,hourly,alerts,flags')
    .extendHourly(false)
    .get()
    .then(handleWeatherResponse)
    .catch(console.log)
