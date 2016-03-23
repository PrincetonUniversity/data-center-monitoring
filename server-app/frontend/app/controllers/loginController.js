(function(){

var cont = angular.module('dcsense.controllers');

cont.controller('loginController', function ($scope, $filter, $http, $location) {

  $.cookie.json = true;

  $scope.user = {
    username: '',
    password: ''
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

});

})();
