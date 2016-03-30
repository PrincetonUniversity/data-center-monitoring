(function(){

var cont = angular.module('dcsense.controllers');

cont.controller('dashController', function ($scope, $filter, $http, $location, $cookies) {

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

      }
    })
    .error(function (data, status, headers, config) {
      alert('Server error.');
    });
  };

  $scope.fetchFacilities();

});

})();
