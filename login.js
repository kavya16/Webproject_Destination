/**
 * Created by KAVYA on 15/5/2017.
 */

var app = angular.module('myLogin', []);
app.controller('LoginController',function($scope,$window) {

    $scope.login = function (uname, pwd) {
        localStorage.setItem("name" , uname); //  Storing user name in local storage
        localStorage.setItem("password" , pwd); // storing password in local store
        if ($scope.uname == "Alaap" && $scope.pwd == "12345") { // if username and password are as we intended login
            $window.location.href = './search.html';
        }
        else
            alert('Login incorrect');                // else prompt user with Login incorrect
    };

    $scope.register = function(){
        $window.location.href = './registration.html'
    };

    $scope.onSignIn = function(googleUser) {
        var profile = googleUser.getBasicProfile();
        console.log('ID: ' + profile.getId());
        console.log('Name: ' + profile.getName());
        console.log('Image URL: ' + profile.getImageUrl());
        console.log('Email: ' + profile.getEmail());
    }
});
