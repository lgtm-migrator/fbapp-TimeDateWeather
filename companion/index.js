import Weather from '../common/weather/phone.js';
import { outbox } from "file-transfer";
import { encode } from "cbor"
import { me } from "companion"

// wake every 5 minutes and refresh weather
me.wakeInterval = 5 * 60 * 1000

console.log("Started companion!");

let weather = new Weather();

weather.setProvider("yahoo"); // only support yahoo for now
weather.setApiKey("mykey");
weather.setFeelsLike(true);

weather.onsuccess = (data) => {
  let weatherdata = JSON.stringify(data);
  console.log("Weather is " + weatherdata);
  
  // transmit the data over ft
  let filename = "weather.cbor";
  outbox.enqueue(filename, encode(data)).then((ft) => {
    console.log("Transfer of " + ft.name + " successfully queued.");
  }).catch((error) => {
    console.log("Failed to queue: " + filename +  ". Error: " + error);
  })
}

weather.onerror = (error) => {
  console.log("Weather error " + JSON.stringify(error));
}

// Update weather at least every 10 minutes when running
// TODO this doesn't work, y tho >_<
setInterval(weather.fetch, 10*60*1000);

me.onwakeinterval = (evt) => {
  console.log("Wakeup interval");
  weather.fetch();
}

// Freshen up weather data on launch
weather.fetch();
