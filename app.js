
const SunEvent = require('./sunevent');
const Homey = require('homey');

const api = new SunEvent();



class SunEventsApp extends Homey.App {

    onInit() {
        console.log("Sun Events start");
        setLocation(function(err) {
            console.log(err);
            if (!err) {
                api.init();
            };
        });
        }
  
  }
 
/* Get the current location of homey and put this into the SunEvent object. Based on this the calculations are made */
function setLocation(callback) {
    //   Homey.log('Call GeoLocation');

    try { 
        var err=false;
        var lat = Homey.ManagerGeolocation.getLatitude();
        var lon = Homey.ManagerGeolocation.getLongitude();
        api.setLatLon(lat, lon);
    }
    catch (e) {
        err=true;
        console.log(e);
    }
    finally {
       if (callback) 
          callback(err);
    }
} 
  
module.exports = SunEventsApp;


