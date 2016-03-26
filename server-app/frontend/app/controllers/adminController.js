(function(){

var cont = angular.module('dcsense.controllers');

cont.controller('adminController', function ($scope, $filter, $http, $location) {

  $scope.user = {
    username: '',
    password: '',
    accessLevel: '2'
  };

  $.cookie.json = true;

  $scope.userValid = function () {
    return ($scope.user.username.length > 4 && $scope.user.password.length > 5);
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

  $scope.logout = function () {
    var ticket = $.cookie('ticket');
    if (ticket) {
      $http.post('/api/auth/logout', {ticket: ticket})
        .success(function (data, status, headers, config) {
          alert('User ' + ticket.username + ' successfully logged out.');
          $.removeCookie('ticket');
          $location.path('/');
        })
        .error(function (data, status, headers, config) {
          alert(data.msg);
        });
      }
  };

});

})();
