(function(){

var cont = angular.module('dcsense.controllers');

cont.controller('dashController', function ($scope, $filter, $http, $location, $cookies) {

  $scope.dateIdx = 0;

  $scope.CtoF = function (c) {
    if (typeof(c) != 'string') {
      var f = c * 9/5 + 32;
      return f.toFixed(1);
    }
    else {
      return c;
    }
  };

  $scope.formatDate = function (dateString) {
    var date = new Date(dateString);
    return date.toLocaleString();
  };

  function formatAMPM(date) {
    var hours = date.getHours();
    var minutes = date.getMinutes();
    var ampm = hours >= 12 ? 'pm' : 'am';
    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'
    minutes = minutes < 10 ? '0'+minutes : minutes;
    var strTime = hours + ':' + minutes + ' ' + ampm;
    return strTime;
  }

  $scope.readingsDate = function () {
    var d = new Date($scope.dates[$scope.dates.length - 1 - $scope.dateIdx]);
    var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'June', 'July', 'Aug', 'Sept', 'Oct', 'Nov', 'Dec'];
    return {
      date: months[d.getMonth()] + ' ' + d.getDate() + ', ' + d.getFullYear(),
      time: formatAMPM(d)
    };
  };

  $scope.facilities = [];
  $scope.currentFacility = '';
  $scope.fetchFacilities = function () {
    var ticket = JSON.parse($cookies.get('ticket'));
    $http.post('/api/facilities/list', {ticket: ticket})
    .success(function (data, status, headers, config) {
      $scope.facilities = data;
      if ($scope.facilities) {
        $scope.currentFacility = $scope.facilities[0].name;
        $scope.fetchControllers();
      }
    })
    .error(function (data, status, headers, config) {
      alert('Server error.');
    });
  };

  $scope.controllers = [];
  $scope.currentControllerIdx = 0;
  $scope.currentController = function () {
    if ($scope.controllers) {
      if ($scope.controllers.length > 0)
        return $scope.controllers[$scope.currentControllerIdx];
    }
    else
      return;
  };
  $scope.currentControllerId = function () {
    if ($scope.controllers) {
      if ($scope.controllers.length > 0)
        return $scope.controllers[$scope.currentControllerIdx].id;
    }
    else
      return;
  };
  $scope.currentControllerName = function () {
    if ($scope.controllers)
      if ($scope.controllers.length > 0)
        return $scope.controllers[$scope.currentControllerIdx].name;
    else
      return;
  };
  $scope.currentControllerWidth = function () {
    if ($scope.controllers)
      if ($scope.controllers.length > 0)
        return $scope.controllers[$scope.currentControllerIdx].width;
    else
      return;
  };
  $scope.currentControllerLayout = function () {
    if ($scope.controllers) {
      if ($scope.controllers.length > 0)
        return $scope.controllers[$scope.currentControllerIdx].layout;
    }
    else
      return;
  };
  $scope.newControllerWidthChange = function (direction) {
    if (direction == 'dec' && $scope.newController.width > 1)
      $scope.newController.width--;
    if (direction == 'inc' && $scope.newController.width < 10)
      $scope.newController.width++;
  };
  $scope.fetchControllers = function () {
    var ticket = JSON.parse($cookies.get('ticket'));
    var facility = encodeURIComponent($scope.currentFacility);
    $http.post('/api/facilities/' + facility + '/list/controllers', {ticket: ticket})
    .success(function (data, status, headers, config) {
      $scope.controllers = data;
      if ($scope.controllers) {
        $scope.newControllerName = $scope.currentControllerName();
        $scope.fetchDates();
      }
    })
    .error(function (data, status, headers, config) {
      alert('Server error.');
    });
  };

  $scope.dates = [];
  $scope.fetchDates = function () {
    var ticket = JSON.parse($cookies.get('ticket'));
    var controller = encodeURIComponent($scope.currentControllerId());
    $http.post('/api/sensors/list/dates/' + controller + '/limit/2016', {ticket: ticket})
    .success(function (data, status, headers, config) {
      $scope.dates = data;
      if ($scope.dates) {
        $('#date-slider').attr('max', $scope.dates.length - 1);
        $scope.dateIdx = $scope.dates.length - 1;
        $scope.currentDate = $scope.dates[$scope.dates.length - 1 - $scope.dateIdx];
        $scope.fetchReadings();
      }
    })
    .error(function (data, status, headers, config) {
      alert('Server error.');
    });
  };

  $scope.fetchReadings = function () {
    var ticket = JSON.parse($cookies.get('ticket'));
    var controller = encodeURIComponent($scope.currentControllerId());
    var date = $scope.currentDate;
    $http.post('/api/sensors/readings/' + controller + '/' + date, {ticket: ticket})
    .success(function (data, status, headers, config) {
      $scope.readings = data;
      if ($scope.readings) {
        // Build a list of readings indexable by bus number and sensor address.
        // e.g. readingsBySensor['2-47'] produces the temperature from sensor at
        // address 47 of bus 2 of the current controller.
        $scope.readingsBySensor = {'0-0': 'No sensor.'};
        $scope.readings.forEach(function (current, index) {
            $scope.readingsBySensor[current.bus + '-' + current.sensor_addr] = current.temp;
        });
        console.log($scope.readingBySensor);
      }
    })
    .error(function (data, status, headers, config) {
      alert('Server error.');
    });
  };

  $scope.commitController = function () {
    // If user is reducing cabinet group width
    if ($scope.newController.width < $scope.currentControllerWidth()) {
      if (!confirm('Reducing the width of your cabinet group will delete sensor ' 
        + 'mappings for the rightmost cabinet(s). Are you sure you want to ' 
        + 'continue?')) {
          return;
      }
      // Copy only the first N cabinets, where N is the new width
      var layout = [];
      for (var i = 0; i < $scope.newController.width; i++) {
        layout.push($scope.currentControllerLayout()[i]);
      }
      $scope.newController.layout = layout;
    }
    // If user is expanding cabinet group width
    else if ($scope.newController.width > $scope.currentControllerWidth()) {
      var layout = [];
      for (var i = 0; i < $scope.currentControllerWidth(); i++) {
        layout.push($scope.currentControllerLayout()[i]);
      }
      var bus = [];
      var addr = [];
      var numSensorsPerCabinet = 5;
      for (var i = 0; i < numSensorsPerCabinet; i++) {
        bus.push(0);
        addr.push(0);
      }
      var cabinet = {bus: bus, addr: addr};
      var numExtraCabinets = $scope.newController.width - $scope.currentControllerWidth();
      for (var i = 0; i < numExtraCabinets; i++) {
        layout.push(cabinet);
      }
      $scope.newController.layout = layout;
    }
    
    
    var ticket = JSON.parse($cookies.get('ticket'));
    var controller = $scope.newController;
    var facility = encodeURIComponent($scope.currentFacility);
    $http.post('/api/facilities/' + facility + '/controllers/update',
               {ticket: ticket, controller: controller})
    .success(function (data, status, headers, config) {
      $scope.controllers[$scope.currentControllerIdx] = data.newController;
      $scope.controllerNameEditing = false;
      $scope.newController = {};
    })
    .error(function (data, status, headers, config) {
      alert('Server error.');
    });
  };

  $scope.controllerNameEditing = false;

  $scope.editController = function () {
    $scope.controllerNameEditing = true;
    $scope.newController = {
      name: $scope.currentControllerName(),
      id: $scope.currentControllerId(),
      width: $scope.currentControllerWidth(),
      layout: $scope.currentControllerLayout()
    };
  };

  $scope.displayMode = 'server';

  $('#date-slider').mouseup(function () { // Desktop
    $scope.fetchReadings();
  });
  $('#date-slider').on('touchend', function () { // Mobile
    $scope.fetchReadings();
  });

  $scope.fetchFacilities();

});

})();
