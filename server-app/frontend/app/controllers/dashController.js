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
  $scope.fetchControllers = function () {
    var ticket = JSON.parse($cookies.get('ticket'));
    var facility = encodeURIComponent($scope.currentFacility);
    $http.post('/api/facilities/' + facility + '/list/controllers', {ticket: ticket})
    .success(function (data, status, headers, config) {
      $scope.controllers = data;
      $scope.controllerIDs = [];
      $scope.controllerNames = [];
      if ($scope.controllers) {
        $scope.controllers.forEach(function (current, index) {
          $scope.controllerIDs.push(current.id);
          $scope.controllerNames.push(current.name);
        });
        $scope.currentController = $scope.controllers[0].id;
        $scope.newControllerName = $scope.controllers[0].name;
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
    var controller = encodeURIComponent($scope.currentController);
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
    var controller = encodeURIComponent($scope.currentController);
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

  $scope.renameController = function () {
    var ticket = JSON.parse($cookies.get('ticket'));
    var controller = encodeURIComponent($scope.currentController);
    var facility = encodeURIComponent($scope.currentFacility);
    $http.post('/api/facilities/' + facility + '/controllers/rename/' + controller,
               {ticket: ticket, newName: $scope.newControllerName})
    .success(function (data, status, headers, config) {
      var controllerIdx = $scope.controllerIDs.indexOf($scope.currentController);
      $scope.controllerNames[controllerIdx] = data.newName;
      $scope.controllers[controllerIdx].name = data.newName;
      $scope.controllerNameEditing = false;
    })
    .error(function (data, status, headers, config) {
      alert('Server error.');
    });
  };

  $scope.controllerNameEditing = false;

  $('#date-slider').mouseup(function () { // Desktop
    $scope.fetchReadings();
  });
  $('#date-slider').on('touchend', function () { // Mobile
    $scope.fetchReadings();
  });

  $scope.fetchFacilities();

});

})();
