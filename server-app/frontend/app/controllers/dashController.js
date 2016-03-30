(function(){

var cont = angular.module('dcsense.controllers');

cont.controller('dashController', function ($scope, $filter, $http, $location, $cookies) {

  $scope.dateIdx = 0;

  // Convert the integer MAC address stored in the db to a readable MAC address
  $scope.controllerIDtoMac = function (id) {
    var hex = parseInt(id).toString(16);
    return [hex.slice(0, 2), ':', hex.slice(2,4), ':', hex.slice(4,6), ':', hex.slice(6,8), ':', hex.slice(8,10), ':', hex.slice(10,12)].join('');
  };

  $scope.formatDate = function (dateString) {
    var date = new Date(dateString);
    var localTime = date.getTime();
    var localOffset = date.getTimezoneOffset() * 60000;
    // obtain UTC time in msec
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
      if ($scope.controllers) {
        $scope.currentController = $scope.controllers[0];
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
    var controller = $scope.currentController;
    $http.post('/api/sensors/list/dates/' + controller + '/limit/1000', {ticket: ticket})
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
    var controller = $scope.currentController;
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

  $('#date-slider').mouseup(function () {
    $scope.fetchReadings();
  });

  $scope.fetchFacilities();

});

})();
