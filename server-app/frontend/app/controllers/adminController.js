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
  $scope.currentController = '';
  $scope.facilityToRemove = '';
  $scope.currentUser = '';
  $scope.userToRemove = '';

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

  $scope.controllerInFacility = function () {
    return ($scope.facilityControllers.indexOf($scope.currentController) != -1);
  };

  // Convert the integer MAC address stored in the db to a readable MAC address
  $scope.controllerIDtoMac = function (id) {
    var hex = parseInt(id).toString(16);
    return [hex.slice(0, 2), ':', hex.slice(2,4), ':', hex.slice(4,6), ':', hex.slice(6,8), ':', hex.slice(8,10), ':', hex.slice(10,12)].join('');
  };

  $scope.register = function () {
    $('#register-button').attr('disabled', 'disabled');
    var user = $scope.user;
    $http.post('/api/auth/register', {user: user})
      .success(function (data, status, headers, config) {
        alert('User ' + user.username + ' successfully registered.');
        $scope.user = {
          username: '',
          password: '',
          accessLevel: '2'
        };
        $scope.fetchUsers();
        $('#register-button').removeAttr('disabled');
      })
      .error(function (data, status, headers, config) {
        alert(data.msg);
        $('#register-button').removeAttr('disabled');
      });
  };

  $scope.addFacility = function () {
    $('#facility-remove-button').attr('disabled', 'disabled');
    var newFacility = $scope.newFacility;
    var ticket = JSON.parse($cookies.get('ticket'));

    $http.post('/api/facilities/add', {facility: newFacility, ticket: ticket})
    .success(function (data, status, headers, config) {
      alert('Facility ' + newFacility.name + ' successfully created.');
      $scope.newFacility = {name: ''};
      $scope.fetchFacilities();
      $('#facility-remove-button').removeAttr('disabled');
    })
    .error(function (data, status, headers, config) {
      alert(data.msg);
      $('#facility-remove-button').removeAttr('disabled');
    });
  };

  $scope.removeFacility = function () {
    $('#facility-add-button').attr('disabled', 'disabled');
    var ticket = JSON.parse($cookies.get('ticket'));
    var facility = encodeURIComponent($scope.facilityToRemove);
    var warning = 'Are you sure you want to delete the facility ' + decodeURIComponent(facility) + '?\n'
                + 'This will irreversibly delete the facility, its list of owners, '
                + 'and any associated server racks.\n'
                + 'All sensor data will NOT be deleted.';
    if (confirm(warning)) {
      $http.post('/api/facilities/' + facility + '/remove', {ticket: ticket})
      .success(function (data, status, headers, config) {
        alert('Facility ' + facility.name + ' successfully deleted.');
        $scope.fetchFacilities();
        $('#facility-remove-button').removeAttr('disabled');
      })
      .error(function (data, status, headers, config) {
        alert(data.msg);
        $('#facility-remove-button').removeAttr('disabled');
      });
    }
  };

  $scope.removeUser = function () {
    $('#user-add-button').attr('disabled', 'disabled');
    var ticket = JSON.parse($cookies.get('ticket'));
    var user = encodeURIComponent($scope.userToRemove);
    var warning = 'Are you sure you want to delete the user ' + decodeURIComponent(user) + '?\n'
                + 'This will irreversibly delete the user and disassociate them from all facilities.\n'
                + 'All sensor data will NOT be deleted.';
    if (confirm(warning)) {
      $http.post('/api/auth/' + user + '/remove', {ticket: ticket})
      .success(function (data, status, headers, config) {
        alert('User ' + user + ' successfully deleted.');
        $scope.fetchUsers();
        $scope.fetchFacilityOwners();
        $('#user-remove-button').removeAttr('disabled');
      })
      .error(function (data, status, headers, config) {
        alert(data.msg);
        $('#user-remove-button').removeAttr('disabled');
      });
    }
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

  $scope.controllers = [];
  $scope.fetchControllers = function () {
    var ticket = JSON.parse($cookies.get('ticket'));
    $http.post('/api/sensors/list/controllers', {ticket: ticket})
    .success(function (data, status, headers, config) {
      $scope.controllers = data;
    })
    .error(function (data, status, headers, config) {
      alert('Server error.');
    });
  };

  $scope.owners = [];
  $scope.fetchFacilityOwners = function () {
    if ($scope.currentFacility == '')
      return;
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

  $scope.currentFacilityForControllers = '';
  $scope.facilityControllers = [];
  $scope.fetchFacilityControllers = function () {
    if ($scope.currentFacilityForControllers == '')
      return;
    var ticket = JSON.parse($cookies.get('ticket'));
    var facility = encodeURIComponent($scope.currentFacilityForControllers);
    $http.post('/api/facilities/' + facility + '/list/controllers', {ticket: ticket})
    .success(function (data, status, headers, config) {
      $scope.facilityControllers = data;
    })
    .error(function (data, status, headers, config) {
      alert('Server error.');
    });
  };
  $scope.changeFacilityController = function (addOrRemove) {
    var ticket = JSON.parse($cookies.get('ticket'));
    var facility = encodeURIComponent($scope.currentFacilityForControllers);
    var controller = $scope.currentController;
    $http.post('/api/facilities/' + facility + '/controllers/' + addOrRemove + '/' + controller, {ticket: ticket})
    .success(function (data, status, headers, config) {
      $scope.fetchFacilityControllers();
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
  $scope.fetchControllers();

});

})();
