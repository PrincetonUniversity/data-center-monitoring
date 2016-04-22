(function(){

var app = angular.module('dcsense', [
  'ngRoute',
  'ngCookies',
  'dcsense.controllers',
  'dcsense.services',
  'dcsense.directives'
]);

var cont = angular.module('dcsense.controllers', [ ]);
var serv = angular.module('dcsense.services', [ ]);
var dir = angular.module('dcsense.directives', [ ]);

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
          return authService.isAuthorized(accessLevels.public);
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
    .when('/dashboard', {
      controller: 'dashController',
      templateUrl: 'app/partials/dash.html',
      resolve: {
        user: function(authService) {
          return authService.isAuthorized(accessLevels.user);
        }
      }
    })
    .when('/about', {
      templateUrl: 'app/partials/about.html'
    })
    .when('/forbidden', {
      templateUrl: 'app/partials/forbidden.html'
    })
    .when('/404', {
      templateUrl: 'app/partials/404.html'
    })
    .otherwise({
      redirectTo: '/404'
    });

});

})();
