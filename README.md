# Rain-Notifier

Small script which sends a PushOver notification when it is NOT going to rain for a while.

I use this to decide whether or not to turn on the manual sprinker at home, since our grass and plants keep dying.

# Setup

Create a `.env` file following the example and fill in the config.

 - `DARK_SKY_KEY` comes from https://darksky.net/dev/register
 - `LAT` and `LON` are the coordinates of where you would like to receive weather from
 - `PUSHOVER_USER` is your USER token for pushover, found in your app
 - `PUSHOVER_TOKEN` is the app token from https://pushover.net/apps/build
 
Simply run `npm start` to run the script, it closes immediately after grabbing the weather and sending a notification

# Run on Heroku

I run this on Heroku using the scheduler, using their CLI:

```
heroku create YOUR-NAME
heroku git:remote -a YOUR-NAME
git push heroku master
```

Configure the Heroku instance with the same options from the `.env`, I used the below but you can use their web interface:

```
sed 's/#[^("|'')]*$//;s/^#.*$//' .env | xargs heroku config:set --app=YOUR-APP
```

Then conigure the scheduler to run the script `npm start` as often as you would like!

```
heroku addons:open scheduler
```
