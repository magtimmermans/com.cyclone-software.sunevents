"use strict";

const SunSet = require('./sunset');

const api = new SunSet();


function init() {
	
	Homey.log("Sun Event start");

	setLocation(function(err) {
		console.log(err);
		if (!err) {
			api.init();
		};
	});
}


/* Get the current location of homey and put this into the Sunset object. Based on this the calculations are made */
function setLocation(callback) {
//   Homey.log('Call GeoLocation');

	Homey.manager('geolocation').getLocation((err, location) => {
		if (!err) {
		//	Homey.log(location);
			api.setLatLon(location.latitude, location.longitude);
		}
		if (callback) {
			callback(err || (!location || location.latitude === false || location.longitude === false), location);
		}
	});
}

module.exports.init = init;