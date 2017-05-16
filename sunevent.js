var SunCalc = require('suncalc');
var moment = require("moment");
var TriggerEvent = require('./triggerEvent').TriggerEvent;
const execFile = require('child_process').execFile;
var tokens = [];
var specialTokens = [];

var sunsetSchedules = {
    'solarNoon': { ename: 'Solar Noon', nlname: 'Hoogste zonnestand', p: true },
    'nadir': { ename: 'Nadir', nlname: 'Donkerste moment van de nacht', p: true },
    'sunrise': { ename: 'Sunrise', nlname: 'Zonsopgang', p: true },
    'sunset': { ename: 'Sunset', nlname: 'Zonsondergang', p: true },
    'sunriseEnd': { ename: 'Sunrise ends', nlname: 'Einde Zonsopgang', p: true },
    'sunsetStart': { ename: 'Sunset starts', nlname: 'Begin Zonsondergang', p: true },
    'dawn': { ename: 'Dawn', nlname: 'Ochtendschemering', p: true },
    'dusk': { ename: 'Dusk', nlname: 'Avondschemering', p: true },
    'nauticalDawn': { ename: 'Nautical dawn', nlname: 'Nautische schemering Ochtend', p: true },
    'nauticalDusk': { ename: 'Nautical dusk', nlname: 'Nautische schemering Avond', p: true },
    'nightEnd': { ename: 'Night ends', nlname: 'Einde Nacht', p: true },
    'night': { ename: 'Night starts', nlname: 'Nacht begint', p: true },
    'goldenHourEnd': { ename: 'Morning golden hour  ends', nlname: 'Einde Ochtend gouden uur', p: true },
    'goldenHour': { ename: 'Evening golden hour starts', nlname: 'Begin avond gouden uur', p: true }
}

var specialVariables = {
    'astronomicalDark': { ename: 'Astronomical Dark', nlname: 'Astronomisch Donker' },
    'nauticalDark': { ename: 'Nautical Dark', nlname: 'Nautische Donker' },
    'civilDark': { ename: 'Civil Dark', nlname: 'Schemering' },
}


var trigger_sorter = function(a, b) {
    return a.compare(b);
};

var autocompleteSorter = function(a, b) {
    if (a.name < b.name) return -1;
    if (a.name > b.name) return 1;
    return 0;
}

/**
 * The SunEvent object
 */
const SunEvent = module.exports = function SunEvent() {
    if (!(this instanceof SunEvent)) {
        return new SunEvent();
    }
};

(function() {

    var selfie = this;
    var sunEvents;
    var activeTriggers = [];

    var lang = Homey.manager('i18n').getLanguage();

    // unable to get locale() information like en-gb
    // than make a hack

    if (lang == 'en') {
        // asume it is Great Britain
        lang = 'en-gb';
    }

    moment.locale(lang);

    this.init = function() {
        Homey.log('Initialize');
        console.log('Language:' + lang);

        selfie.sunEvents = selfie.getTimes();
        Homey.log(selfie.sunEvents);

        this.registerTriggers();
        this.registerVars();

        this.LoadMyEvents(function(result) {
            selfie.sunEvents = selfie.getTimes(true);
        });

        this.resetAtMidnight();

        Homey.manager('flow').on('trigger.sun_event.update', selfie.registerTriggers);

        Homey.manager('flow').on('trigger.sun_event.event.autocomplete', function(callback, args) {
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

            myItems.sort(autocompleteSorter);

            // console.log(myItems);

            callback(null, myItems); // err, results
        });

        Homey.manager('flow').on('condition.cond_sun_event.event.autocomplete', function(callback, args) {
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

            myItems.sort(autocompleteSorter);
            // console.log(myItems);

            callback(null, myItems); // err, results
        });

         Homey.manager('flow').on('condition.cond_sun_event_time.event.autocomplete', function(callback, args) {
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

            myItems.sort(autocompleteSorter);
            // console.log(myItems);

            callback(null, myItems); // err, results
        });


        Homey.manager('flow').on('trigger.sun_event', function(callback, args, state) {
            if (args.event.id == state.event && args.offset == state.offset) {
                callback(null, true);
            } else {
                callback(null, false); // true to make the flow continue, or false to abort
            }
            return;
        });


        Homey.manager('flow').on('condition.cond_sun_event', function(callback, args, state) {
            //  Homey.log('condition');
            //  Homey.log(args);
            var result = selfie.testEvent(args.event.id, args.offset);
            callback(null, result);
        });

        Homey.manager('flow').on('condition.cond_sun_event_time', function(callback, args, state) {
            var times = args.time.split(':');
            if(times.length === 2) {
	            var today = new Date();
				today = new Date(today.getFullYear(), today.getMonth(), today.getDate(), times[0], times[1], 0, 0);
		        var eventTimes = selfie.getTimes(false);
		        var d = eventTimes[args.event.id];


		        var result = ((d.getTime()) >= today.getTime());
		        console.log('Event:' + padding_right(args.event.id, ' ', 17) +
	            'Date:' + padding_right(moment(d).format('LLL'), ' ', 20) +
	            'result:' + result);


				callback(null, result);
            } else {
	            callback('Invalid time', false);
            }
        });


        Homey.manager('settings').on('set', function(action) {
            Homey.log('sunset:settings changed');
            Homey.log('sunset:' + action);
            if (action == 'myEvents') {
                selfie.LoadMyEvents(function(result) {
                    // if (result) {
                    selfie.sunEvents = selfie.getTimes(true);
                    selfie.registerTriggers();
                    // }
                });
            }
        });
        console.log(moment().format('L'));

        // update specialvars every minute , should be ok (not exact time)
        setInterval(function() {
            selfie.updateSpecialVars();
        }, 1 * 60 * 1000); // Every minute, maybe not too resource friendly...
    };

    this.registerTriggers = function() {

        // Fetch all registered triggers args
        Homey.manager('flow').getTriggerArgs('sun_event', (err, triggers) => {
            if (!err && triggers) {

                selfie.activeTriggers = [];

                // Loop over triggers
                triggers.forEach(trigger => {

                    // Homey.log(trigger);

                    // Check if all args are valid and present
                    if (trigger && trigger.hasOwnProperty('event') && trigger.hasOwnProperty('offset')) {

                        selfie.scheduleTrigger(trigger);
                    }
                });

                var myTriggerTimesFormated = {};
                selfie.activeTriggers.forEach(function(item) {
                    var e = {};
                    e.name = selfie.getSunsetScheduleName(item.id);
                    e.date = moment.unix(item.theTime.epoch).format('LLL');
                    myTriggerTimesFormated[item.id] = e;
                });
                Homey.manager("settings").set('myTriggerTimes', myTriggerTimesFormated);
            }
            // Homey.log(activeTriggers);
        });
    }

    this.scheduleTrigger = function(trigger) {

        var id = trigger.event.id;

        var offset = trigger.offset;
        var when = selfie.sunEvents[id];

        // testing
        // when = new Date();
        // when = moment(when).add(randomInt(60, 120), 'seconds').toDate();

        var te = new TriggerEvent(id, when, offset);

        if (te.compare() < 0) {
            // in the past
            return;
        }

        // check if already exist and remove

        selfie.activeTriggers.push(te);

        selfie.scheduler();

    }

    this.execute = function(te) {
        // Homey.log('#######################################################')
        // Homey.log('execute:' + te.id);
        var tokens = { 'event': selfie.getSunsetScheduleName(te.id), 'se_time': moment.unix(te.theTime.epoch).format('LT'), 'se_date': moment.unix(te.theTime.epoch).format('L') };
        var state = { 'event': te.id, 'offset': te.theTime.offset };
        Homey.manager('flow').trigger('sun_event', tokens, state);
    }

    this.scheduler = function() {

        if (selfie._timer_id) {
            clearTimeout(selfie._timer_id);
        }

        if (selfie.activeTriggers.length === 0) {
            // nothing to do
            return;
        }

        // first trigger on top
        selfie.activeTriggers.sort(trigger_sorter);

        while (true) {
            var te = selfie.activeTriggers[0];
            if (te.compare() > 0) {
                // not ready
                break;
            }

            // yeah can be triggered
            selfie.execute(te);
            selfie.activeTriggers.shift();
            if (selfie.activeTriggers.length === 0) {
                // was last item can stop know;
                break;
            }
        }

        if (selfie.activeTriggers.length === 0) {
            // nothing to do
            return;
        }

        // first trigger on top
        selfie.activeTriggers.sort(trigger_sorter);

        var te = selfie.activeTriggers[0];
        // if (te) {
        //     console.log(te.id + ' delta:' + te.compare());
        // }
        //when something is running kill it
        if (selfie._timer_id) {
            clearTimeout(selfie._timer_id);
            selfie._timer_id = null;
        }

        var check = function() {
            var delta = 0;
            if (typeof selfie.activeTriggers[0] != 'undefined') {
                delta = selfie.activeTriggers[0].compare();
            }
            if (delta > 60) {
                //  console.log('check');
                selfie._timer_id = setTimeout(check, 60 * 1000);
            } else {
                //console.log('less minute');
                selfie._timer_id = setTimeout(function() {
                    selfie.scheduler();
                }, delta * 1000);
            }
        };
        check();
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
            // do some work at midnight
            selfie.sunEvents = selfie.getTimes(true);
            selfie.registerTriggers();
            selfie.updateVars();
            selfie.resetAtMidnight(); //      Then, reset again next midnight.
        }, msToMidnight);
    }

    this.registerVars = function() {
        bySortedValue(selfie.sunEvents, function(key, value) {
            var name = selfie.getSunsetScheduleName(key);
            Homey.manager('flow').registerToken(key, {
                type: 'string',
                title: name
            }, function(err, token) {
                if (err) return console.error('registerToken error:', err);
                console.log(token);
                var date = selfie.sunEvents[token.id];
                var time = moment(date).format('HH:mm');
                token.setValue(time, function(err) {
                    if (err) return console.error('setValue error:', err);
                });
                tokens.push(token);
            });
        })
        GetSpecialVars(selfie.sunEvents, function(key, value) {
            var name = (lang == 'nl' ? specialVariables[key].nlname : specialVariables[key].ename)
            Homey.manager('flow').registerToken(key, {
                type: 'boolean',
                title: name
            }, function(err, token) {
                if (err) return console.error('registerToken error:', err);
                token.setValue(value, function(err) {
                    if (err) return console.error('setValue error:', err);
                });
                specialTokens.push(token);
            });
        })
    }

    this.updateVars = function() {
        tokens.forEach(function(token) {
            if (token) {
                var date = selfie.sunEvents[token.id];
                var time = moment(date).format('HH:mm');
                token.setValue(time,
                    function(err) {
                        if (err) return console.error('setValue error:', err);
                    });
            }
        })
    }

    this.updateSpecialVars = function() {
        GetSpecialVars(selfie.sunEvents, function(key, value) {
            console.log(key);
            console.log(value);
            var token = specialTokens.filter(function(value) { return value.id == key; })
            console.log(token);
            if (token) {
                token[0].setValue(value,
                    function(err) {
                        if (err) return console.error('setValue error:', err);
                    });
            }
        })
    }

    this.getSunsetScheduleName = function(id) {
        // maybe this can be smarter using localization strings
        return (lang == 'nl' ? sunsetSchedules[id].nlname : sunsetSchedules[id].ename);
    }

    this.testEvent = function(id, offset) {
        var today = new Date()
        offset = offset * 60 * 1000;
        var eventTimes = selfie.getTimes(false);
        var d = eventTimes[id];
        var result = ((d.getTime() + offset) < today.getTime());
        console.log('Event:' + padding_right(id, ' ', 17) +
            'Date:' + padding_right(moment(d).format('LLL'), ' ', 20) +
            'Offset(sec):' +
            padding_right('' + (offset / 1000), ' ', 6) +
            'result:' + result);
        return result;
    }

    this.getTimes = function(force) {
        var today = new Date()
        var refDate = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 12, 0, 0, 0, 0);
        var eventTimes = SunCalc.getTimes(refDate, this.lat, this.lon);
        var currentMillis = today.getTime();
        if (force) {
            var eventTimesFormated = {};
            var items = Object.keys(sunsetSchedules);
            items.forEach(function(item) {
                var e = {};
                e.name = selfie.getSunsetScheduleName(item);
                e.date = moment(eventTimes[item]).format('LLL');
                eventTimesFormated[item] = e;
            });
            Homey.log(eventTimesFormated);
            Homey.manager("settings").set('myEventsTimes', eventTimesFormated);
            //console.log('sunset:myEventsTimes saved');
        }
        return eventTimes;
    }

    this.LoadMyEvents = function(callback) {
        var data = Homey.manager("settings").get('myEvents');
        if (data) {
            var myEvents = JSON.parse(Homey.manager("settings").get('myEvents'));
            if (myEvents) {
                SunCalc.clearCustomTimes();
                //clear sunsetSchedules
                var keys = Object.keys(sunsetSchedules);
                keys.forEach(function(k) {
                    var it = sunsetSchedules[k];
                    if (it.p == false) {
                        delete sunsetSchedules[k];
                    }
                });

                myEvents.forEach(function(item) {
                    SunCalc.addCustomTime(item.degrees, item.riseName, item.setName);
                    sunsetSchedules[item.riseName] = { ename: item.riseName, nlname: item.riseName, p: false };
                    sunsetSchedules[item.setName] = { ename: item.setName, nlname: item.setName, p: false };
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
    this.setLatLon = function(lat, lon) {
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

}).call(SunEvent.prototype);


// needed for testing
function randomInt(low, high) {
    return Math.floor(Math.random() * (high - low) + low);
}

// right padding s with c to a total of n chars
function padding_right(s, c, n) {
    if (!s || !c || s.length >= n) {
        return s;
    }
    var max = (n - s.length) / c.length;
    for (var i = 0; i < max; i++) {
        s += c;
    }
    return s;
}

function bySortedValue(obj, callback, context) {
    var items = [];

    for (var key in obj) items.push([key, obj[key]]);

    items.sort(function(a, b) { return a[1] < b[1] ? 1 : a[1] > b[1] ? -1 : 0 });

    var length = items.length;
    while (length--) callback.call(items, items[length][0], items[length][1]);
}

function GetSpecialVars(items, callback) {
    var specialVars = {};
    var now = moment();
    if (moment().isBetween(items['nauticalDawn'], items['nauticalDusk'])) {
        specialVars['astronomicalDark'] = false;
    } else {
        specialVars['astronomicalDark'] = true;
    }

    if (moment().isBetween(items['dawn'], items['dusk'])) {
        specialVars['nauticalDark'] = false;
    } else {
        specialVars['nauticalDark'] = true;
    }

    if (moment().isBetween(items['sunrise'], items['sunset'])) {
        specialVars['civilDark'] = false;
    } else {
        specialVars['civilDark'] = true;
    }

    for (var key in specialVars) {
        callback.call(specialVars, key, specialVars[key]);
    }
}