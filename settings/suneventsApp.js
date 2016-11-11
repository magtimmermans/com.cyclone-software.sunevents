var myApp = angular.module('suneventsApp',["xeditable", "ngMockE2E"]);

myApp.run(function(editableOptions, editableThemes) {
  editableThemes.bs3.inputClass = 'input-sm';
  editableThemes.bs3.buttonsClass = 'btn-sm';
  editableOptions.theme = 'bs3';
});

myApp.filter('orderObjectBy', function() {
  return function(items, field, reverse) {
    var filtered = [];
    angular.forEach(items, function(item) {
      filtered.push(item);
    });
    filtered.sort(function (a, b) {
      return (a[field] > b[field] ? 1 : -1);
    });
    if(reverse) filtered.reverse();
    return filtered;
  };
});


myApp.controller('mySunEvents', function($scope, $filter, $http) {
 var temp;
 
  $scope.events = []; 
  $scope.myEventsTimes = [];
  
  $scope.homey;

  $scope.setHomey = function(homey) {
    console.log('setHomey called');
    $scope.homey=homey;
    $scope.homey.get('myEvents', function(err, newEvents) {
        console.log(newEvents);
        if (!newEvents) {
            newEvents = [];
        }
        $scope.$apply(function() {
            console.log('Set New Events:'+newEvents);
            $scope.events = angular.fromJson(newEvents);
            console.log($scope.events);
        });
    });
    $scope.homey.get('myEventsTimes', function(err, myEventsTimes) {
        console.log('get myEventsTimes:'+myEventsTimes);
        if (!myEventsTimes) {
            myEventsTimes = [];
        }
        $scope.$apply(function() {
            console.log('Apply get myEventsTimes:'+myEventsTimes);
            $scope.myEventsTimes = angular.fromJson(myEventsTimes);
            console.log($scope.myEventsTimes);
        });
    }); 
    $scope.homey.on('set', function (action) {
      if (action == 'myEventsTimes') { 
        console.log('change myEventsTimes');
        $scope.homey.get('myEventsTimes', function(err, myEventsTimes) {
            console.log(myEventsTimes);
            if (!myEventsTimes) {
                myEventsTimes = [];
            }
            $scope.$apply(function() {
                console.log('Set myEventsTimes:'+myEventsTimes);
                $scope.myEventsTimes = angular.fromJson(myEventsTimes);
                console.log($scope.myEventsTimes);
            });
        });        
      }
    });
  }

  $scope.checkDegrees = function(data) {
    if (typeof data === 'undefined') {
      return "Degrees must be between -90 and 90";
    }
  };

  $scope.checkNotEmpty = function(data) {
    if (typeof data === 'undefined') {
      return "Field cannot be empty";
    }
  };

  $scope.saveEvent = function(data, id) {
    //$scope.event not updated yet
    console.log('saveEvent');
    angular.extend(data, {id: id});
    console.log(data);
    return true;
  };

   $scope.sendToHomey= function(data){
      console.log('---events-----');
      console.log(data);
      temp = angular.toJson($scope.events);
      console.log(temp);
      $scope.homey.set('myEvents', temp);
   }

  // remove event
  $scope.removeEvent = function(index) {
    $scope.events.splice(index, 1);
    $scope.homey.set('myEvents', angular.toJson($scope.events));
  };

  // add event
  $scope.addEvent = function() {
    $scope.inserted = {
      id: $scope.events.length+1,
      degrees: 0,
      riseName: '',
      setName: '' 
    };
    $scope.events.push($scope.inserted);
  };
});

