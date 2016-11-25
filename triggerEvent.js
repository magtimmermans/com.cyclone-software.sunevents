const moment = require("moment");


const TriggerEvent = function(id, when, offset) {
    const self = this;

    //console.log(when);

    // if no date give get todays date
    var dt_now = new Date();

    var dt_when = when;

    if (when === undefined) {
        dt_when = dt_now;
    }

    if (offset === undefined) {
        offset = 0;
    }

    if (offset) {
        dt_when = moment(dt_when).add(offset, 'minutes').toDate();
    }

    console.log('TriggerEvent: ' + id + ' when:' + dt_when);

    self.id = id;
    self.theTime = {};
    self.theTime.when = dt_when;
    self.theTime.offset = offset;
    self.theTime.epoch = dt_when.getTime() / 1000.0;
}

TriggerEvent.prototype.compare = function(event) {
    const self = this;
    var ms_compare;

    if (event === undefined) {
        ms_compare = (new Date).getTime() / 1000;
    } else if (typeof event === "object") {
        ms_compare = event.theTime.epoch;
    } else {
        throw new Error("unrecognized argument", paramd);
    }

    return self.theTime.epoch - ms_compare;
};

exports.TriggerEvent = TriggerEvent;