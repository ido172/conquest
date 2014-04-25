/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

var map;

function initialize() {
    
    var mapOptions = {
        zoom: 24,
        disableDefaultUI: true

    };
    map = new google.maps.Map(document.getElementById('new_game_map-canvas'),
            mapOptions);

    // Try HTML5 geolocation
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function(position) {
            var pos = new google.maps.LatLng(position.coords.latitude,
                    position.coords.longitude);

            var marker = new google.maps.Marker({
                position: pos,
                map: map,
                title: 'Center of the game',
                draggable: true
            });

            map.setCenter(pos);
        }, function() {
            handleNoGeolocation(true);
        });
    } else {
        // Browser doesn't support Geolocation
        handleNoGeolocation(false);
    }

    //map.setOptions({draggable: false});

    google.maps.event.addListener(map, "click", setStake(e));
}
;

function handleNoGeolocation(errorFlag) {
    if (errorFlag) {
        var content = 'Error: The Geolocation service failed.';
    } else {
        var content = 'Error: Your browser doesn\'t support geolocation.';
    }

    var options = {
        map: map,
        position: new google.maps.LatLng(60, 105),
        content: content
    };

    map.setCenter(options.position);
}

$(function() {
    $('#new_game_page').on("pageshow", initialize);
});

function setStake(event) {
    //lat and lng is available in e object
    var latLng = e.latLng;
    var image = 'img/red_flag.png';
    var beachMarker = new google.maps.Marker({
        position: latLng,
        map: map,
        icon: image
    });
}
;
