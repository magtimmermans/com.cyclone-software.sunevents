# Sun Events (replace Sunrise App)

Sun Events is an app the has several triggers to certain positions of the sun. It make use of suncalc from 'Vladimir Agafonkin'. The following triggers are possible:

- sunrise (top edge of the sun appears on the horizon)
- sunrise ends (bottom edge of the sun touches the horizon)
- morning golden hour (soft light, best time for photography) ends
- solar noon (sun is in the highest position)
- goldenHour (evening golden hour starts)
- sunset starts (bottom edge of the sun touches the horizon)
- sunset (sun disappears below the horizon, evening civil twilight starts)
- dusk (evening nautical twilight starts)
- nautical dusk (evening astronomical twilight starts)
- night starts (dark enough for astronomical observations)
- nadir (darkest moment of the night, sun is in the lowest position)
- night ends (morning astronomical twilight starts)
- nautical dawn (morning nautical twilight starts)
- dawn (morning nautical twilight ends, morning civil twilight starts)
- Options to put your own set/rise position of the sun

On every card you can fill in a offset in minutes between -60 and 60. This to delay or speed-up for example the sunset time.

## TO-DO
- Automatic refresh of settings page when events/triggers are refreshed.

## Change Log:

### v 0.2.4
Improved multi language support and added German translation.

### v 0.2.2
Small changes and add some text to the README file.

### v 0.2.1
In case the calculated date gives an invalid date, this will be represented as Thu Jan 01 1970 01:00:00.

### v 0.2.0
 Rewrite to SDK V2.0. Added between to events condition card.

### v 0.1.8
 Added Altitude as TAG for the sun Angle (0..90 degrees) and corrected Azimuth angle (in degrees (0 North, 180 South)

### v 0.1.7
 Added Azimuth angle (in degrees) as tag, some bug fixes and dutch translation of the programname

### v 0.1.6
fixed compare bug

### v 0.1.5
Added global var TAGS and three general tags:
 - Astronomical Dark
 - Nautical Dark
 - Civil Dark

### v 0.1.4
small bugfix what could crash the app

### v.0.1.3
Made a fix for the correct locale in English.

### v.0.1.2
Changed sorting in the Event Times and Trigger Times.

### v.0.1.1
Improved Localization

### v.0.1.0
App was refused at app-store. Rebuild app partly but leave the dynamic completion list in it because you can easily at your own events.

### v 0.0.8
Complete rebuild of the app. Also rename it from Sunrise to SunEvents. The old app will not further developed and this app can replace the old SunRise app. The reason for this is that your existing workflows will not brake and you can change whenever you like. 

### v 0.0.6
added 'and' cards (with offset), removed offset from trigger cards as this cannot function correctly currently.

### v 0.0.5
fixed issue why triggers didn't work sometimes

### v 0.0.4
- small changes and update to appstore
- Image created by 4tetra4! Thanks!

### v 0.0.3
Added trigger options XX minutes before/after sunset/sunrise etc
Know issue, when you change the offset, the old offset will be affective after the first trigger... Then the new one will be applied.
-10 is 10 minutes earlier, +10 is 10 minutes later then the sunset trigger (f.e.)
default = 0 range -60..60

### v 0.0.2
Fix for possible duplicate triggers.


### v 0.0.1
First release and first app :)

## Donate
This is an open source application and totaly free. 
By donating you support me in my work of which I do in my own free time.
[![Paypal Donate](https://www.paypalobjects.com/en_US/i/btn/btn_donateCC_LG.gif)](https://www.paypal.com/cgi-bin/webscr?cmd=_s-xclick&hosted_button_id=C7AFUHG2JB7BL)