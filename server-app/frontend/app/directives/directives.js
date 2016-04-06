(function(){

var dir = angular.module('dcsense.directives');

dir.directive('logout', function ($http, $location, $cookies) {
  return {
    link: function (scope, element, attrs) {
      element.bind('click', function () {
        var ticket = JSON.parse($cookies.get('ticket'));
        if (ticket) {
          $http.post('/api/auth/logout', {ticket: ticket})
          .success(function (data, status, headers, config) {
            $cookies.remove('ticket');
            $location.url('/');
          })
          .error(function (data, status, headers, config) {
            alert(data.msg);
          });
        }
        else {
          $location.url('/');
        }
      });
    }
  }
});

dir.directive('convertToNumber', function() {
  return {
    require: 'ngModel',
      link: function(scope, element, attrs, ngModel) {
        ngModel.$parsers.push(function(val) {
        return parseInt(val, 10);
        });
        ngModel.$formatters.push(function(val) {
        return '' + val;
        });
      }
  }
});

})();
