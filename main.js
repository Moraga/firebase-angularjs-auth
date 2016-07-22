angular.module('dash.controllers', ['firebase', 'ngRoute'])
    .service('$db', function ($firebaseObject, $firebaseArray) {

        var base = 'https://MY-FIREBASE-URL.firebaseio.com/';

        function db(name=[]) {
            return {
                name,
                onAuth(...args) {
                    return this.get().onAuth(...args);
                },
                authWithPassword(...args) {
                    return this.get().authWithPassword(...args);
                },
                get() {
                    return new Firebase(base + name.join('/'));
                },
                all() {
                    return $firebaseArray(this.get());
                }
            }
        }

        var proxy = {
            get(target, property) {
                return property in target
                    ? target[property]
                    : new Proxy(db(target.name.slice().concat([property])), proxy);
            }
        };

        return new Proxy(db(), proxy);
    })
    .service('$auth', function ($db, $location) {
        return new Promise((resolve, reject) => {
            // listening user authentication state
            $db.onAuth(authData => {
                if (authData) {
                    resolve();
                } else {
                    $location.path('/login');
                    reject();
                }
            });
        });
    })
    .controller('main', function ($scope, $db) {

        // getting node values
        $scope.customers = $db.users.customer.all();

    })
    .controller('dash', function () {

        // welcome to dashboard

    })
    .controller('login', function ($scope, $db, $location) {
        $scope.submit = () => {
            $db.authWithPassword({
                email: $scope.email,
                password: $scope.password
            }, (error, authData) => {
                 if (error) {
                     $scope.error = error;
                } else {
                    $location.path('/');
                }
            });
        };
    })
    .config(function($routeProvider, $locationProvider) {
        $routeProvider
            .when('/', {
                templateUrl: 'dash',
                controller: 'dash',
                resolve: {
                    auth: function ($auth) {
                        return $auth;
                    }
                }
            })
            .when('/login', {
                templateUrl: 'login',
                controller: 'login'
            })
            .otherwise({
                redirect: '/'
            });
    });
