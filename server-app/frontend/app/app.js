(function(){

var app = angular.module('dcsense', [
  'ngRoute',
  'ngCookies',
  'dcsense.controllers',
  'dcsense.services'
]);

var cont = angular.module('dcsense.controllers', [ ]);
var serv = angular.module('dcsense.services', [ ]);

var accessLevels = {
  public: 1,
  user: 2,
  admin: 3
};

app.config(function ($routeProvider) {

  // configure view routing
  $routeProvider
    .when('/', {
      controller: 'loginController',
      templateUrl: 'app/partials/login.html',
      resolve: {
        user: function(authService) {
          return authService.isAuthorized(accessLevels.admin);
        }
      }
    })
    .when('/admin', {
      controller: 'adminController',
      templateUrl: 'app/partials/admin.html',
      resolve: {
        user: function(authService) {
          return authService.isAuthorized(accessLevels.admin);
        }
      }
    })
    .otherwise({
      redirectTo: '/'
    });

});

})();
