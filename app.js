'use strict';

// Declare app level module which depends on views, and components
angular.module('myApp', [])


    .controller('View1Ctrl', function ($scope, $http) { // Angular JS function


        $scope.venueList = new Array();
        $scope.mostRecentReview;
        $scope.getVenues = function () {
            var placeEntered = document.getElementById("txt_placeName").value; // takes place entered from form
            var searchQuery = document.getElementById("txt_searchFilter").value; // takes filter element from form
            if (placeEntered != null && placeEntered != "" && searchQuery != null && searchQuery != "") { // error checking
                document.getElementById('div_ReviewList').style.display = 'none';
                //This is the API that gives the list of venues based on the place and search query.
                var handler = $http.get("https://api.foursquare.com/v2/venues/search" + // sends a http request from device to web
                    "?client_id=Q0ENF1YHFTNPJ31DCF13ALLENJW0P5MTH13T1SA0ZP1MUOCI" +
                    "&client_secret=ZH4CRZNEWBNTALAE3INIB5XG0QI12R4DT5HKAJLWKYE1LHOG" +
                    "&v=20160215&limit=4" +
                    "&near=" + placeEntered + // place and searchQueary are added to http request
                    "&query=" + searchQuery);
                handler.success(function (data) { // handling the responce

                    if (data != null && data.response != null && data.response.venues != undefined && data.response.venues != null) {
                        for (var i = 0; i < data.response.venues.length; i++) {
                            $scope.venueList[i] = {
                                "name": data.response.venues[i].name, // retriving elements from Json Object
                                "id": data.response.venues[i].id,
                                "location": data.response.venues[i].location,
                                "contact": data.response.venues[i].contact,
                            };
                        }
                    }
                })
                handler.error(function (data) { // in case of error this function is executed
                    alert("There was some error processing your request. Please try after some time.");
                });
            }
        }
        $scope.signOut = function () { // for sign out but not added in website
            var auth2 = gapi.auth2.getAuthInstance();
            auth2.signOut().then(function () {
                console.log('User signed out.');
            });
        }

        $scope.getReviews = function (venueSelected) { // function for getting reviews
            for(var x = 0; x <= 1;x++) {
            if (venueSelected != null) {
                //This is the API call being made to get the reviews(tips) for the selected place or venue.
                var handler = $http.get("https://api.foursquare.com/v2/venues/" + venueSelected.id + "/tips" +
                    "?sort=recent" +
                    "&client_id=Q0ENF1YHFTNPJ31DCF13ALLENJW0P5MTH13T1SA0ZP1MUOCI" +
                    "&client_secret=ZH4CRZNEWBNTALAE3INIB5XG0QI12R4DT5HKAJLWKYE1LHOG&v=20160215" +
                    "&limit=5");
                handler.success(function (result) {
                    if (result != null && result.response != null && result.response.tips != null &&
                        result.response.tips.items != null) {
                        $scope.mostRecentReview = result.response.tips.items[0];
                        //This is the Alchemy API for getting the sentiment of the most recent review for a place.
                        var callback = $http.get("http://gateway-a.watsonplatform.net/calls/text/TextGetTextSentiment" +
                            "?apikey=af1cb48ca4d7daacfb629467c82c56eced7ce918" +
                            "&outputMode=json&text=" + $scope.mostRecentReview.text);
                        callback.success(function (data) {
                            if(data!=null && data.docSentiment!=null)
                            {
                                $scope.ReviewWithSentiment = { // retriving from JSon object
                                    "reviewText" : $scope.mostRecentReview.text,

                                    "sentiment":data.docSentiment.type,
                                    "score":data.docSentiment.score
                                };
                                document.getElementById('div_ReviewList').style.display = 'block';
                            }
                            convertToSpeech();
                        })
                    }
                })
                handler.error(function (result) { // error handling
                    alert("There was some error processing your request. Please try after some time.")
                })

            }

            }
        }
        $scope.getDes = function (des) { // function will automatically takes destination element and pastes in maps scearch bar
            alert(des);
            document.getElementById("destination-input").value = des;
            };


    });


function convertToSpeech() { // this function will takes the text from table element and send to text to speech API
    var all = '';
    var oTable = document.getElementById('myTable');
    var rowLength = oTable.rows.length;
    for (var i = 0; i < rowLength; i++) {
        var oCells = oTable.rows.item(i).cells;
        var cellLength = oCells.length;
        for (var j = 0; j < cellLength; j++) {
            all = all + " " + oCells.item(j).innerText;
        }
    }
    var textToSpeechUrl = 'https://stream.watsonplatform.net/text-to-speech/api/v1/synthesize?username=435b009a-3158-4396-b381-679f4f257f87&password=ouIcjibu8QYg&text=' + all;
    document.getElementById("playAudio").innerHTML = "<video controls='' autoplay='' name='media'><source src='" + textToSpeechUrl + "' type='audio/ogg'></video>";

}

    // This will initilaze the maps on screen with given some geo locations
    function initMap() {
        var map = new google.maps.Map(document.getElementById('map'), {  //This creates map in a divison with ID "map" with given map properties
            mapTypeControl: false,
            center: {lat: -33.8688, lng: 151.2195}, // map options
            zoom: 13
        });

        new AutocompleteDirectionsHandler(map);
    }

    function calculateAndDisplayRoute(directionsService, directionsDisplay) { // creating a function to calculate the route
        directionsService.route({
            origin: document.getElementById('start').value,   // Takes the value of starting point from text field
            destination: document.getElementById('end').value, // Takes the value of Destination point from tesx field
            travelMode: 'DRIVING'
        }, function (response, status) {          // Function to check response from google server and if ok give directions or alert user
            if (status === 'OK') {
                directionsDisplay.setDirections(response);
            } else {
                window.alert('Directions request failed due to ' + status);
            }
        });
    }


    /**
     * @constructor
     */
    function AutocompleteDirectionsHandler(map) {  //Function take a map object as input and calculates directions and also auto completes the fields
        this.map = map;
        this.originPlaceId = null;
        this.destinationPlaceId = null;
        this.travelMode = 'WALKING';
        var originInput = document.getElementById('origin-input');
        var destinationInput = document.getElementById('destination-input');
        var modeSelector = document.getElementById('mode-selector');
        this.directionsService = new google.maps.DirectionsService;       // this creates object for Direction services
        this.directionsDisplay = new google.maps.DirectionsRenderer;      // this creates object for Direction Rendering
        this.directionsDisplay.setMap(map);             //This method specifies the map on which directions will be rendered. Pass null to remove the directions from map

        var originAutocomplete = new google.maps.places.Autocomplete(
            originInput, {placeIdOnly: true});
        var destinationAutocomplete = new google.maps.places.Autocomplete(
            destinationInput, {placeIdOnly: true});

        this.setupClickListener('changemode-walking', 'WALKING');
        this.setupClickListener('changemode-transit', 'TRANSIT');
        this.setupClickListener('changemode-driving', 'DRIVING');

        this.setupPlaceChangedListener(originAutocomplete, 'ORIG');
        this.setupPlaceChangedListener(destinationAutocomplete, 'DEST');

        this.map.controls[google.maps.ControlPosition.TOP_LEFT].push(originInput);
        this.map.controls[google.maps.ControlPosition.TOP_LEFT].push(destinationInput);
        this.map.controls[google.maps.ControlPosition.TOP_LEFT].push(modeSelector);
    }

// Sets a listener on a radio button to change the filter type on Places
// Autocomplete.
    AutocompleteDirectionsHandler.prototype.setupClickListener = function (id, mode) {
        var radioButton = document.getElementById(id);
        var me = this;
        radioButton.addEventListener('click', function () {
            me.travelMode = mode;
            me.route();
        });
    };

    AutocompleteDirectionsHandler.prototype.setupPlaceChangedListener = function (autocomplete, mode) {
        var me = this;
        autocomplete.bindTo('bounds', this.map);
        autocomplete.addListener('place_changed', function () {
            var place = autocomplete.getPlace();
            if (!place.place_id) {
                window.alert("Please select starting and Destination places.");
                return;
            }
            if (mode === 'ORIG') {
                me.originPlaceId = place.place_id;
            } else {
                me.destinationPlaceId = place.place_id;
            }
            me.route();
        });

    };

    AutocompleteDirectionsHandler.prototype.route = function () {
        if (!this.originPlaceId || !this.destinationPlaceId) {
            return;
        }
        var me = this;

        this.directionsService.route({
            origin: {'placeId': this.originPlaceId},
            destination: {'placeId': this.destinationPlaceId},
            travelMode: this.travelMode
        }, function (response, status) {
            if (status === 'OK') {
                me.directionsDisplay.setDirections(response);
            } else {
                window.alert('Directions request failed due to ' + status);
            }
        });
    };
