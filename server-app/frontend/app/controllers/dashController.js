(function(){

var cont = angular.module('dcsense.controllers');

cont.controller('dashController', function ($scope, $filter, $http, $location, $cookies) {

  $scope.dateIdx = 0;
  $scope.loading = true;
  $scope.displayMode = 'server';
  $scope.controllerNameEditing = false;
  $scope.cabinetMode = 'view';
  $scope.alertThreshold = 70;

  $scope.CtoF = function (c) {
    if (c && typeof(c) != 'string') {
      var f = c * 9/5 + 32;
      return f.toFixed(1) + '°F';
    }
    else {
      return 'No sensor.';
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
    $scope.loading = true;
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
    $scope.loading = true;
    var ticket = JSON.parse($cookies.get('ticket'));
    var facility = encodeURIComponent($scope.currentFacility);
    $http.post('/api/facilities/' + facility + '/list/controllers', {ticket: ticket})
    .success(function (data, status, headers, config) {
      $scope.controllers = data;
      if ($scope.controllers) {
        $scope.fetchDates();
        $scope.getAlerts();
      }
    })
    .error(function (data, status, headers, config) {
      alert('Server error.');
    });
  };

  $scope.dates = [];
  $scope.fetchDates = function () {
    $scope.loading = true;
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
    $http.post('/api/sensors/readings/bydate/' + controller + '/' + date, {ticket: ticket})
    .success(function (data, status, headers, config) {
      $scope.readings = data;
      if ($scope.readings) {
        // Build a list of readings indexable by bus number and sensor address.
        // e.g. readingsBySensor['2-47'] produces the temperature from sensor at
        // address 47 of bus 2 of the current controller.
        $scope.readingsBySensor = {
          '0-0': 'No sensor.'
        };
        $scope.readings.forEach(function (current, index) {
            $scope.readingsBySensor[current.bus + '-' + current.sensor_addr] = current.temp;
        });
        $scope.fetchAddressMappingList();
        $scope.loading = false;
      }
    })
    .error(function (data, status, headers, config) {
      alert('Server error.');
    });
  };
  
  $scope.fetchAddressMappingList = function () {
    var ticket = JSON.parse($cookies.get('ticket'));
    var controller = encodeURIComponent($scope.currentControllerId());
    var date = $scope.currentDate;
    $http.get('/api/sensors/addressmappings/')
    .success(function (data, status, headers, config) {
      $scope.map = data;
      console.log(data);
    })
    .error(function (data, status, headers, config) {
      alert('Server error.');
    });
  };
  
  $scope.unicodeSwitchesFromBinary = function (binary) {
    var ret = '';
    for (var i = 0; i < binary.length; i++) {
      if (binary.charAt(i) == '1') {
        ret = ret + '▀ ';
      }
      if (binary.charAt(i) == '0') {
        ret = ret + '▄ ';
      }
    }
    return ret;
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

  $scope.editController = function () {
    $scope.controllerNameEditing = true;
    $scope.newController = {
      name: $scope.currentControllerName(),
      id: $scope.currentControllerId(),
      width: $scope.currentControllerWidth(),
      layout: $scope.currentControllerLayout()
    };
  };

  $('#date-slider').mouseup(function () { // Desktop
    $scope.fetchReadings();
  });
  $('#date-slider').on('touchend', function () { // Mobile
    $scope.fetchReadings();
  });
  
  $scope.enableCabinetMapping = function () {
    if (!confirm('Are you sure you want to edit the sensor mappings for this cabinet?'))
      return;
    $scope.cabinetMode = 'mapping';
    console.log($scope.currentControllerLayout());
  };
  
  $scope.disableCabinetMapping = function () {
    $scope.cabinetMode = 'view';
  };
  
  $scope.currentMapping = '';
  $scope.currentMappingCabinet = function () {
    if ($scope.currentMapping == '')
      return;
    return $scope.currentMapping.split('-')[0];
  };
  $scope.currentMappingSensor = function () {
    if ($scope.currentMapping == '')
      return;
    return $scope.currentMapping.split('-')[1];
  };
  
  $scope.currentSensor = '';
  $scope.currentSensorCabinet = function () {
    if ($scope.currentSensor == '')
      return;
    return $scope.currentSensor.split('-')[0];
  };
  $scope.currentSensorRow = function () {
    if ($scope.currentSensor == '')
      return;
    return $scope.currentSensor.split('-')[1];
  };
  
  $scope.sensorClick = function (sensor) {
    if ($scope.cabinetMode == 'mapping') {
      $scope.editSensorMapping(sensor);
    }
    else {
      $scope.displaySensorGraph(sensor);
    }
  };
  $scope.editSensorMapping = function (sensor) {
    if ($scope.cabinetMode != 'mapping')
      return;
    $scope.currentMapping = sensor;
    $scope.newController = {
      name: $scope.currentControllerName(),
      id: $scope.currentControllerId(),
      width: $scope.currentControllerWidth(),
      layout: $scope.currentControllerLayout()
    };
    $('.cabinet').css('opacity', 0.4);
  };
  $scope.disableSensorMapping = function (sensor) {
    $scope.currentMapping = '';
    $('.cabinet').css('opacity', 1);
    $scope.commitController();
  };
  $scope.displaySensorGraph = function (sensor) {
    var ticket = JSON.parse($cookies.get('ticket'));
    
    $scope.currentSensor = sensor;
    var controller = encodeURIComponent($scope.currentControllerId());
    var layout = $scope.currentControllerLayout();
    var bus = layout[$scope.currentSensorCabinet()].bus[$scope.currentSensorRow()];
    var addr = layout[$scope.currentSensorCabinet()].addr[$scope.currentSensorRow()]
    
    if (bus == 0 || addr == 0) {
      return;
    }
    
    $http.post('/api/sensors/readings/bysensor/' + controller + '/' + addr + '/' + bus + '/2weeks', {ticket: ticket})
    .success(function (data, status, headers, config) {
      console.log(data);
      $('#graph1').empty();
      var l1 = new LineGraph({containerId: 'graph1', data: data});
    })
    .error(function (data, status, headers, config) {
      alert('Server error.');
    });
  };
  
  $scope.alertReadings = [];
  $scope.getAlerts = function () {
    var ticket = JSON.parse($cookies.get('ticket'));
    var controller = encodeURIComponent($scope.currentControllerId());
    var threshold = encodeURIComponent($scope.alertThreshold);
    $http.post('/api/sensors/readings/hightemps/' + controller + '/' + threshold + '/2weeks', {ticket: ticket})
    .success(function (data, status, headers, config) {
      $scope.alertReadings = data;
      $scope.lastAlertThreshold = $scope.alertThreshold;
    })
    .error(function (data, status, headers, config) {
      alert('Server error.');
    });
  };
  
  $scope.export = function () {
    var startDate = encodeURIComponent(0);
    var endDate = encodeURIComponent(new Date().getTime());
    var ticket = JSON.parse($cookies.get('ticket'));
    $http.post('/api/sensors/export/all/' + startDate + '/' + endDate, {ticket: ticket})
    .success(function (data, status, headers, config) {
      var a = document.createElement('a');
      var file = new Blob([data], {type: 'text/csv'});
      a.href = URL.createObjectURL(file);
      a.download = 'dcsense.csv';
      a.click();
    })
    .error(function (data, status, headers, config) {
      alert('Server error.');
    });
  }

  $scope.fetchFacilities();

});

})();
