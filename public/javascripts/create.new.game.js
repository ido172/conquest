var newGameName = "";
var newGameMap;

$(document).ready(function(){
    $('#new_game_set_map_page').on('pageshow', initializeNewGameMap);
});

function createNewGame() {
    $.mobile.changePage("#new_game_page");
};

function setMap() {
    newGameName = $("#new_game_name").val();
     if (/\S/.test(newGameName)) {
        $.mobile.changePage("#new_game_set_map_page");
    } else {
        alert("Please Enter Game Name");
    }
    
};
function submitNewGame() {
    //alert("submitNewGame");
    var data = {
        center_map: JSON.stringify(newGameMap.getCenter()),
        map_zoom: newGameMap.getZoom(),
        game_name: newGameName
    };

    post('createNewGame', data, joinGame);	
}

function initializeNewGameMap() {
    var mapOptions = {
        zoom: 20,
        disableDefaultUI: true,
        draggable: true,
        zoomControl: true,
        disableDoubleClickZoom: true,
        featureType: "poi",
        stylers: [{visibility: "off"}]
    };
    newGameMap = new google.maps.Map(document.getElementById('new_game_map-canvas'),
            mapOptions);

    // Try HTML5 geolocation
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function(position) {
            var pos = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
            newGameMap.setCenter(pos);
        }, function() {
            handleNoGeolocation(true);
        });
    } else {
        // Browser doesn't support Geolocation
        handleNoGeolocation(false);
    }
};