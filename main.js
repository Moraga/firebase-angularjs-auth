angular.module('dash', ['firebase', 'ngRoute'])
    .service('$db', function ($firebaseObject, $firebaseArray) {

        var base = 'https://MY-FIREBASE-URL.firebaseio.com/';

        function struct($name=[]) {
            return {
                $path,
                onAuth(...args) {
                    return this.get().onAuth(...args);
                },
                authWithPassword(...args) {
                    return this.get().authWithPassword(...args);
                },
                get() {
                    return $firebaseObject(this.ref());
                },
                all() {
                    return $firebaseArray(this.get());
                },
                ref() {
                    return new Firebase(base + $path.join('/'));
                }
            }
        }

        var proxy = {
            get(target, property) {
                return property in target
                    ? target[property]
                    : new Proxy(struct(target.$path.concat([property])), proxy);
            }
        };

        return new Proxy(struct(), proxy);
    })
    .service('$auth', function ($db, $location) {
        return new Promise((resolve, reject) => {
            // listen user auth state
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

        // getting node values from Firebase

        $scope.data = $db.any.path.from.database.all();


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
