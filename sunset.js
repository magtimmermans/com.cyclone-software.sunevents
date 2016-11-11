const SunCalc = require('suncalc');
//const moment = require('moment');

var sunsetSchedules = {
            'solarNoon' : {ename:'Solar Noon',nlname:'Hoogste zonnestand',p:true},
            'nadir' : {ename:'Nadir',nlname:'Donkerste moment van de nacht',p:true},
            'sunrise' : {ename:'Sunrise',nlname:'Zonsopgang',p:true},
            'sunset' : {ename:'Sunset',nlname:'Zonsondergang',p:true},
            'sunriseEnd' : {ename:'Sunrise ends',nlname:'Einde Zonsopgang',p:true},
            'sunsetStart' : {ename:'Sunset starts',nlname:'Begin Zonsondergang',p:true},
            'dawn' : {ename:'Dawn',nlname:'Ochtendschemering',p:true},
            'dusk' : {ename:'Dusk',nlname:'Avondschemering',p:true},
            'nauticalDawn' : {ename:'Nautical dawn',nlname:'Nautische schemering Ochtend',p:true},
            'nauticalDusk' : {ename:'Nautical dusk',nlname:'Nautische schemering Avond',p:true},
            'nightEnd' : {ename:'Night ends',nlname:'Einde Nacht',p:true},
            'night' : {ename:'Night starts',nlname:'Nacht begint',p:true},
            'goldenHourEnd' : {ename:'Morning golden hour  ends',nlname:'Einde Ochtend gouden uur',p:true},
            'goldenHour' : {ename:'Evening golden hour starts',nlname:'Begin avond gouden uur',p:true}
}

var activeTriggers = [];

/**
 * The SunSet object
 */
const SunSet = module.exports = function SunSet() {
	if (!(this instanceof SunSet)) {
		return new SunSet();
	}
};

(function () {
    
    var selfie=this;

    var lang = Homey.manager('i18n').getLanguage();
    
    this.init = function(){
        Homey.log('Initialize'); 
        console.log('Language:'+lang);

        this.registerTriggers();
        this.LoadMyEvents(function(result) {
             selfie.getTimes(true);
        });


        this.resetAtMidnight();

	    Homey.manager('flow').on('trigger.sun_event.update', this.registerTriggers);

        Homey.manager('flow').on('trigger.sun_event.event.autocomplete', function( callback, args ){
            // console.log('autocomplete');
            // console.log(args);

            var myItems = [];

            var items = Object.keys(sunsetSchedules);
            items.forEach(function(item) {
               var e = {};
               e.name = selfie.getSunsetScheduleName(item);
               e.id = item;
               myItems.push(e);
            });

           // console.log(myItems);

            callback( null, myItems ); // err, results
        });

        Homey.manager('flow').on('condition.cond_sun_event.event.autocomplete', function( callback, args ){
            // console.log('autocomplete');
            // console.log(args);

            var myItems = [];

            var items = Object.keys(sunsetSchedules);
            items.forEach(function(item) {
               var e = {};
               e.name = selfie.getSunsetScheduleName(item);
               e.id = item;
               myItems.push(e);
            });

           // console.log(myItems);

            callback( null, myItems ); // err, results
        });

        Homey.manager('flow').on('trigger.sun_event', function (callback,args,state) {
         // Homey.log('trigger');
         // Homey.log(args);
         // Homey.log(state);
          if ( args.event.id == state.event && args.offset == state.offset) {
               // Homey.log('### Callback Oke:' + args.event.id);
                callback(null,true);
                return;
           } else {
                callback(null, false); // true to make the flow continue, or false to abort
           }
        });

        Homey.manager('flow').on('condition.cond_sun_event', function( callback, args, state ){
              //  Homey.log('condition');
              //  Homey.log(args);
                var result = selfie.testEvent(args.event.id,args.offset);
                callback( null, result );
        }); 

        Homey.manager('settings').on('set', function (action) {
            Homey.log('sunset:settings changed');
            Homey.log('sunset:'+action);
            if (action == 'myEvents') {      
                selfie.LoadMyEvents(function(result) {
                   // if (result) {
                        selfie.getTimes(true);
                   // }   
                });
            }
        });
        
        var today = new Date()
        var refDate = new Date(today.getFullYear(), today.getMonth(),today.getDate(), 12, 0, 0, 0, 0);

        // var c1 = new Date(refDate.getFullYear(), refDate.getMonth(),refDate.getDate(), 19, 26, 0, 0, 0);
        // var c2 = new Date(refDate.getFullYear(), refDate.getMonth(),refDate.getDate(), 19, 26, 0, 0, 0);
        // console.log(c1 + ' ' +c2);
        // console.log(moment(c1).diff(c2, 'seconds'))



       
        var sunEvents= this.getTimes();
        Homey.log(sunEvents);
        setInterval(timers_update,1000);
        function timers_update() {
                var now =new Date;
                var currentSunEvents=selfie.getTimes();
                activeTriggers.forEach(function(item) {                  
                        var d = currentSunEvents[item.id];
                        // if (item.id =='dawn') {
                        //     d = new Date(refDate.getFullYear(), refDate.getMonth(),refDate.getDate(), 22,25, 0, 0, 0);
                        //    // console.log(item + ':' + d);    
                        // }
                        var diff = Math.floor((d.getTime() + (item.offset*1000*60) - now.getTime()) / 1000);
                        //console.log(diff);
                        if ( diff == 0) {
                            Homey.log("####Value triggered: ",item.id);
                            console.log(d);
                            console.log(now);
                            console.log(diff);
                            // Homey.manager('flow').trigger('countdown_test');
                            var tokens = { 'event' : selfie.getSunsetScheduleName(item.id) };
                            var state = { 'event' : item.id, 'offset':item.offset };
                            Homey.manager('flow').trigger('sun_event', tokens, state);
                        }
                });
            };        
    };

    this.registerTriggers = function() {

        // Fetch all registered triggers args
        Homey.manager('flow').getTriggerArgs('sun_event', (err, triggers) => {
            if (!err && triggers) {

                activeTriggers = [];

                // Loop over triggers
                triggers.forEach(trigger => {

                    Homey.log(trigger);

                    // Check if all args are valid and present
                    if (trigger && trigger.hasOwnProperty('event') && trigger.hasOwnProperty('offset')) {

                    	// Register trigger
                        var obj = {};
                        obj.id=trigger.event.id;
                        obj.offset = trigger.offset;
                    	activeTriggers.push(obj);
                    }
                });
            }
            Homey.log(activeTriggers);
        });
    } 

    this.resetAtMidnight = function() {
        var now = new Date();
        var night = new Date(
            now.getFullYear(),
            now.getMonth(),
            now.getDate() + 1, // the next day, ...
            0, 0, 0 // ...at 00:00:00 hours
        );
        
        var msToMidnight = night.getTime() - now.getTime();

        setTimeout(function() {
            selfie.getTimes(true);          //      <-- This is the function being called at midnight.
            selfie.resetAtMidnight();      //      Then, reset again next midnight.
        }, msToMidnight); 
    }

    this.getSunsetScheduleName = function(id) {      
        return (lang == 'nl' ?  sunsetSchedules[id].nlname :   sunsetSchedules[id].ename);   
    }
    
    this.testEvent = function(id,offset) {
        var today = new Date()
        offset = offset * 60 * 1000;
        var eventTimes = this.getTimes(false);
        var d = eventTimes[id];
        var result = ((d.getTime()+offset)<today.getTime());
        console.log('Event:'+padding_right(id,' ',17) + 
                    'Date:'+padding_right(getShortDate(d),' ',20) + 
                    'Offset(sec):' + 
                    padding_right(''+(offset/1000),' ',6) + 
                    'result:' + result);
        return result;
    }

    this.getTimes = function (force) {
        var today = new Date()
        var refDate = new Date(today.getFullYear(), today.getMonth(),today.getDate(), 12, 0, 0, 0, 0);
        var eventTimes = SunCalc.getTimes(refDate, this.lat,this.lon);
        var currentMillis = today.getTime();
        if (force) {
            var eventTimesFormated = {};
            var items = Object.keys(sunsetSchedules);
            items.forEach(function(item) {
               var e = {};
               e.name = selfie.getSunsetScheduleName(item);
               e.date = eventTimes[item];
               eventTimesFormated[item]= e;
            });
            Homey.log(eventTimesFormated);
            Homey.manager("settings").set('myEventsTimes',eventTimesFormated);
            console.log('sunset:myEventsTimes saved');
        }
        return eventTimes;
    }

    this.LoadMyEvents = function(callback) {
        var data=Homey.manager("settings").get('myEvents');
        if (data) {
            var myEvents = JSON.parse(Homey.manager("settings").get('myEvents'));
        // Homey.log(myEvents);
            if (myEvents) {
                SunCalc.clearCustomTimes();
                //clear sunsetSchedules
                var keys = Object.keys(sunsetSchedules);
                keys.forEach(function(k) {
                    var it = sunsetSchedules[k];
                    if (it.p==false) {
                        delete sunsetSchedules[k];
                    }
                });

                myEvents.forEach(function(item) {
                    SunCalc.addCustomTime(item.degrees, item.riseName, item.setName);
                    sunsetSchedules[item.riseName] ={ename:item.riseName,nlname:item.riseName,p:false};
                    sunsetSchedules[item.setName] ={ename:item.setName,nlname:item.setName,p:false};
                // console.log(sunsetSchedules);
                }) 
                callback(true);
            } else
                callback(false);

        } else
            callback(false);
    }

    
    /**
	 * Change the lat/lon the api uses.
	 * @param lat the latitude
	 * @param lon the longitude
	 */
	this.setLatLon = function (lat, lon) {
 		if (isNaN(lat) || isNaN(lon)) {
			throw new Error('new location is incorrect!');
		}
	    selfie.lat = lat;
    	selfie.lon = lon;
	};
    
    /* get the current date */
    this.getNow = function() {
        return new Date();
    };
 
}).call(SunSet.prototype);

function isNumeric(n) {
  return !isNaN(parseFloat(n)) && isFinite(n);
}

function isValidDate(d) {
        if ( isNaN( d.getTime() ) ) { 
            return false;
        }
        else {
            return true;
        }
}

function getShortDate(d) {
    year = "" + d.getFullYear();
    month = "" + (d.getMonth() + 1); if (month.length == 1) { month = "0" + month; }
    day = "" + d.getDate(); if (day.length == 1) { day = "0" + day; }
    hour = "" + d.getHours(); if (hour.length == 1) { hour = "0" + hour; }
    minute = "" + d.getMinutes(); if (minute.length == 1) { minute = "0" + minute; }
    second = "" + d.getSeconds(); if (second.length == 1) { second = "0" + second; }
    return year + "-" + month + "-" + day + " " + hour + ":" + minute + ":" + second;
}

// right padding s with c to a total of n chars
function padding_right(s, c, n) {
  if (! s || ! c || s.length >= n) {
    return s;
  }
  var max = (n - s.length)/c.length;
  for (var i = 0; i < max; i++) {
    s += c;
  }
  return s;
}


