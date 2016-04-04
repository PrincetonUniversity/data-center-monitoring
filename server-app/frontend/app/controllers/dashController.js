(function(){

var cont = angular.module('dcsense.controllers');

cont.controller('dashController', function ($scope, $filter, $http, $location, $cookies) {

  $scope.dateIdx = 0;

  $scope.CtoF = function (c) {
    var f = parseFloat(c) * 9/5 + 32;
    return f.toFixed(1);
  };

  $scope.formatDate = function (dateString) {
    var date = new Date(dateString);
    return date.toLocaleString();
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
        //$scope.currentControllerIdx = 0;
        /*$(document).ready(function () {
          setTimeout(function () {
            $('#controller-select').val(0);
            console.log('done');
          }, 200);
        });*/
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

      }
    })
    .error(function (data, status, headers, config) {
      alert('Server error.');
    });
  };

  $scope.commitController = function () {
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
      width: $scope.currentControllerWidth()
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
