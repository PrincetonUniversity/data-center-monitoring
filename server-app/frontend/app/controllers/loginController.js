(function(){

var cont = angular.module('dcsense.controllers');

cont.controller('loginController', function ($scope, $filter, $http, $location) {

  $.cookie.json = true;

  $scope.userMode = 'login';

  $scope.user = {
    username: '',
    password: ''
  };

  $scope.newUser = {
    username: '',
    password: '',
    accessLevel: '2'
  };

  $.urlParam = function(name){
    var results = new RegExp('[\?&]' + name + '=([^&#]*)').exec(window.location.href);
    if (results) {
      return results[1] || 0;
    } else {
      return null;
    }
  };

  $scope.userValid = function () {
    return ($scope.user.username.length > 4 && $scope.user.password.length > 5);
  };

  $scope.newUserValid = function () {
    return ($scope.newUser.username.length > 4 && $scope.newUser.password.length > 5);
  };

  $scope.login = function () {
    $('#login-button').attr('disabled', 'disabled');
    var user = $scope.user;
    $http.post('/api/auth/login', {user: user})
      .success(function (data, status, headers, config) {
        $scope.user = {username: '', password: ''};
        $.cookie('ticket', data.ticket, {expires: new Date(data.ticket.expires)});
        $('#login-button').removeAttr('disabled');
        var desiredPath = decodeURIComponent($.urlParam('r'));
        if (desiredPath !== 'null') {
          $location.url(desiredPath);
        }
        else {
          $location.url('/dashboard'); // change this once dash page exists
        }
      })
      .error(function (data, status, headers, config) {
        alert(data.msg);
        $('#login-button').removeAttr('disabled');
      });
  };

  $scope.register = function () {
    $('#register-button').attr('disabled', 'disabled');
    var user = $scope.newUser;
    $http.post('/api/auth/register-nonadmin', {user: user})
      .success(function (data, status, headers, config) {
        alert('User ' + user.username + ' successfully registered.');
        $scope.user = user;
        $scope.login();
      })
      .error(function (data, status, headers, config) {
        alert(data.msg);
        $('#register-button').removeAttr('disabled');
      });
  };

  // Disallow spaces in username field
  $('.username').on({
    keydown: function(e) {
      if (e.which === 32)
        return false;
    },
    change: function() {
      this.value = this.value.replace(/\s/g, '');
    }
  });

});

})();
