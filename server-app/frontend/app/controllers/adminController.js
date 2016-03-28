(function(){

var cont = angular.module('dcsense.controllers');

cont.controller('adminController', function ($scope, $filter, $http, $location, $cookies) {

  $scope.user = {
    username: '',
    password: '',
    accessLevel: '2'
  };

  $scope.newFacility = {
    name: ''
  };

  $scope.currentFacility = '';

  $.cookie.json = true;

  $scope.userValid = function () {
    return ($scope.user.username.length > 4 && $scope.user.password.length > 5);
  };

  $scope.facilityValid = function () {
    return ($scope.newFacility.name.length >= 2);
  };

  $scope.userIsOwner = function () {
    return ($scope.owners.indexOf($scope.currentUser) != -1);
  };

  $scope.register = function () {
    $('#register-button').attr('disabled', 'disabled');
    var user = $scope.user;
    $http.post('/api/auth/register', {user: user})
      .success(function (data, status, headers, config) {
        alert('User ' + user.username + ' successfully registered.');
        $scope.user = {username: '', password: ''};
        $('#register-button').removeAttr('disabled');
      })
      .error(function (data, status, headers, config) {
        alert(data.msg);
        $('#register-button').removeAttr('disabled');
      });
  };

  $scope.addFacility = function () {
    $('#facility-add-button').attr('disabled', 'disabled');
    var newFacility = $scope.newFacility;
    var ticket = JSON.parse($cookies.get('ticket'));
    $http.post('/api/facilities/add', {facility: newFacility, ticket: ticket})
    .success(function (data, status, headers, config) {
      alert('Facility ' + facility.name + ' successfully added.');
      $scope.facility = {name: ''};
      $('#facility-add-button').removeAttr('disabled');
    })
    .error(function (data, status, headers, config) {
      alert(data.msg);
      $('#facility-add-button').removeAttr('disabled');
    });
  };

  $scope.users = [];
  $scope.fetchUsers = function () {
    var ticket = JSON.parse($cookies.get('ticket'));
    $http.post('/api/auth/list/users', {ticket: ticket})
    .success(function (data, status, headers, config) {
      $scope.users = data;
    })
    .error(function (data, status, headers, config) {
      alert('Server error.');
    });
  };

  $scope.facilities = [];
  $scope.fetchFacilities = function () {
    var ticket = JSON.parse($cookies.get('ticket'));
    $http.post('/api/facilities/list', {ticket: ticket})
    .success(function (data, status, headers, config) {
      $scope.facilities = data;
    })
    .error(function (data, status, headers, config) {
      alert('Server error.');
    });
  };

  $scope.owners = [];
  $scope.fetchFacilityOwners = function () {
    var ticket = JSON.parse($cookies.get('ticket'));
    var facility = encodeURIComponent($scope.currentFacility);
    $http.post('/api/facilities/' + facility + '/list/owners', {ticket: ticket})
    .success(function (data, status, headers, config) {
      $scope.owners = data;
    })
    .error(function (data, status, headers, config) {
      alert('Server error.');
    });
  };

  $scope.changeFacilityOwner = function (addOrRemove) {
    var ticket = JSON.parse($cookies.get('ticket'));
    var facility = encodeURIComponent($scope.currentFacility);
    var user = $scope.currentUser;
    $http.post('/api/facilities/' + facility + '/owners/' + addOrRemove + '/' + user, {ticket: ticket})
    .success(function (data, status, headers, config) {
      $scope.fetchFacilityOwners();
    })
    .error(function (data, status, headers, config) {
      alert('Server error.');
    });
  };



  // On page ready:
  $scope.fetchUsers();
  $scope.fetchFacilities();

});

})();
