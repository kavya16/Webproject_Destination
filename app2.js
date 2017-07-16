/**
 * Created by KAVYA on 15/5/2017.
 */
angular.module('GoogleDirection', [])
    .controller('googlemapoutput', function ($scope) {

        var map;
        var mapOptions;
        var directionsDisplay = new google.maps.DirectionsRenderer({
            draggable: true
        });
        var directionsService = new google.maps.DirectionsService();

        $scope.initialize = function () {
            var pos = new google.maps.LatLng(0, 0);
            var mapOptions = {
                zoom: 3,
                center: pos
            };

            map = new google.maps.Map(document.getElementById('map-canvas'),
                mapOptions);
        };
        $scope.calcRoute = function () {
            var end = document.getElementById('endlocation').value;
            var start = document.getElementById('startlocation').value;

            var request = {
                origin: start,
                destination: end,
                travelMode: google.maps.TravelMode.DRIVING
            };

            directionsService.route(request, function (response, status) {
                if (status == google.maps.DirectionsStatus.OK) {
                    directionsDisplay.setMap(map);
                    directionsDisplay.setDirections(response);
                    console.log(status);
                }

            });
        };

        google.maps.event.addDomListener(window, 'load', $scope.initialize);

    });
