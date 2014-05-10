var currentGameID;
var map;
var tempStakeList = [];
var currentTriangle;
var currentLine;
var mapText;
var isAnimatedTrianle = false;
var gameInitData;
var gameData;
//-------------------------

function startGame(gameData) {
    gameInitData = gameData;
    gameInitData.centerMap = JSON.parse(gameData.centerMap);
    $.mobile.changePage("#game_page");
    setInterval(updateGame, 500);
}


function initializeGameMap() {
    //alert("initializeGameMap");
    gameData = {};
    gameData.players = [];
    gameData.stakes = [];
    gameData.triangles = [];
    gameData.allDrawing = [];
    mapText = document.getElementById("onMapText");
    var mapOptions = {
        center: new google.maps.LatLng(gameInitData.centerMap.k, gameInitData.centerMap.A),
        zoom: gameInitData.zoomMap,
        disableDefaultUI: true,
        draggable: false,
        zoomControl: false,
        scrollwheel: false,
        disableDoubleClickZoom: true,
        featureType: "poi",
        stylers: [
            {visibility: "off"}
        ]
    };
    map = new google.maps.Map(document.getElementById('map-canvas'), mapOptions);
    google.maps.event.addListener(map, "click", sendStake);
}
;

function updateGame() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function(position) {
            var pos = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
            var data = {
                game_id: currentGameID,
                user_id: userID,
                pos: JSON.stringify(pos)
            };
            post("getGameUpdate", data, updateGameMap);

        }, function() {

        });
    }
}

function sendStake(e) {
    var latLng = e.latLng;
    var data = {
        game_id: currentGameID,
        team: userTeam,
        pos: JSON.stringify(latLng),
        user_id: userID
    }
    post('setStake', data, function() {
    });
}

function updateGameMap(data) {

    for (var i = 0; i < gameData.allDrawing.length; ++i) {
        gameData.allDrawing[i].setMap(null);
    }
    gameData.allDrawing = [];

    for (var i = 0; i < data.stakes.length; ++i) {
        var position = JSON.parse(data.stakes[i].pos);
        var image = 'images/' + data.stakes[i].team + '_flag_small.png';
        var marker = new google.maps.Marker({
            position: new google.maps.LatLng(position.k, position.A),
            map: map,
            icon: image
        });
        gameData.allDrawing.push(marker);
    }

    for (var i = 0; i < data.triangles.length; ++i) {
        
        var pos1 = JSON.parse(data.triangles[i].pos1);
        var pos2 = JSON.parse(data.triangles[i].pos2);
        var pos3 = JSON.parse(data.triangles[i].pos3);
        var path = [
            new google.maps.LatLng(pos1.k, pos1.A),
            new google.maps.LatLng(pos2.k, pos2.A),
            new google.maps.LatLng(pos3.k, pos3.A),
        ]
        var triangle = new google.maps.Polygon({
            paths: path,
            strokeColor: data.triangles[i].team,
            strokeOpacity: 1,
            strokeWeight: 2.5,
            fillColor: data.triangles[i].team,
            fillOpacity: 0.5,
            map: map
        });
        gameData.allDrawing.push(triangle);
    }





    /*
     if (isAnimatedTrianle) return;
     
     //remove deleted
     for (var i = 0; i < gameData.stakesRed.length; i++) {
     if (data.stakes.indexOf(gameData.stakesRed[i]) === -1) {
     gameData.stakesRed.splice(i, 1);
     }
     }
     for (var i = 0; i < gameData.stakesBlue.length; i++) {
     if (data.stakes.indexOf(gameData.stakesBlue.stakesRed[i]) === -1) {
     gameData.stakesBlue.splice(i, 1);
     }
     }
     
     
     
     //draw new
     data.players.forEach(function(player) {
     gameData.players.push(player._id);
     });
     
     data.stakes.forEach(function(stake) {
     if (stake.team == "red") {
     if (gameData.stakesRed.indexOf(stake._id) === -1) {
     gameData.stakesRed.push(stake._id);
     }
     } else {
     if (gameData.stakesBlue.indexOf(stake._id) === -1) {
     gameData.stakesBlue.push(stake._id);
     }
     }
     
     drawStake(stake, stake.team);
     });
     
     data.triangles.forEach(function(triangle) {
     if (gameData.triangles.indexOf(triangle._id) === -1) {
     gameData.triangles.push(triangle._id);
     drawTriangle(triangle);
     }
     
     });
     */
}



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
//------------------------







/*
 function drawStake(e) {
 if (isAnimatedTrianle)
 return;
 tempStakeList.push(e.latLng);
 var latLng = e.latLng;
 var image = 'images/' + userTeam + '_flag_small.png';
 var beachMarker = new google.maps.Marker({
 position: latLng,
 map: map,
 icon: image
 });
 if (tempStakeList.length == 2) {
 isAnimatedTrianle = true;
 animateLine(0, 1, false);
 } else if (tempStakeList.length == 3) {
 isAnimatedTrianle = true;
 animateLine(1, 2, false);
 }
 };
 */
function animateLine(i, j, stopflag) {
    var step = 0;
    var numSteps = 50; //Change this to set animation resolution
    var timePerStep = 3; //Change this to alter animation speed
    var interval = setInterval(function() {
        if (currentLine != null) {
            currentLine.setMap(null);
        }
        step++;
        currentLine = new google.maps.Polyline({
            strokeColor: userTeam,
            strokeOpacity: step / numSteps,
            strokeWeight: 1.5,
            geodesic: true, //set to false if you want straight line instead of arc
        });

        var are_we_there_yet = google.maps.geometry.spherical.interpolate(tempStakeList[i], tempStakeList[j], step / numSteps);
        currentLine.setPath([tempStakeList[i], are_we_there_yet]);
        currentLine.setMap(map);

        if (step > numSteps) {
            clearInterval(interval);
            currentLine = null;
            if (tempStakeList.length == 3 && stopflag == false) {
                animateLine(2, 0, true);
            } else if (stopflag == true) {
                animateTrianle();
            } else {
                isAnimatedTrianle = false;
            }
        }
    }, timePerStep);
}

function animateLine(i, j, stopflag) {
    var step = 0;
    var numSteps = 50; //Change this to set animation resolution
    var timePerStep = 3; //Change this to alter animation speed
    var interval = setInterval(function() {
        if (currentLine != null) {
            currentLine.setMap(null);
        }
        step++;
        currentLine = new google.maps.Polyline({
            strokeColor: userTeam,
            strokeOpacity: step / numSteps,
            strokeWeight: 1.5,
            geodesic: true, //set to false if you want straight line instead of arc
        });

        var are_we_there_yet = google.maps.geometry.spherical.interpolate(tempStakeList[i], tempStakeList[j], step / numSteps);
        currentLine.setPath([tempStakeList[i], are_we_there_yet]);
        currentLine.setMap(map);

        if (step > numSteps) {
            clearInterval(interval);
            currentLine = null;
            if (tempStakeList.length == 3 && stopflag == false) {

                animateLine(2, 0, true);
            } else if (stopflag == true) {
                animateTrianle();
            }
        }
    }, timePerStep);
}

function animateTrianle() {

    var step = 0;
    var numSteps = 50; //Change this to set animation resolution
    var timePerStep = 3; //Change this to alter animation speed

    // set animation
    var interval = setInterval(function() {
        if (currentTriangle != null) {
            currentTriangle.setMap(null);
        }
        step++;
        console.log(step / 150);
        currentTriangle = new google.maps.Polygon({
            paths: tempStakeList,
            strokeColor: userTeam,
            strokeOpacity: 1,
            strokeWeight: 2.5,
            fillColor: userTeam,
            fillOpacity: step / 150,
        });
        currentTriangle.setMap(map);

        // break animation
        if (step > numSteps) {
            clearInterval(interval);
            currentTriangle = null;
            tempStakeList = [];
            isAnimatedTrianle = false;
            showText("TRIANGLE CAPTURED!!");
        }
    }, timePerStep);
}

function showText(text) {
    var step = 0;
    var numSteps = 50; //Change this to set animation resolution
    var timePerStep = 3; //Change this to alter animation speed
    mapText.style.display = "";
    mapText.innerHTML = text;
    // set animation
    var interval = setInterval(function() {
        if (currentTriangle != null) {
            currentTriangle.setMap(null);
        }
        step++;
        mapText.style.opacity = step / 50;

        // break animation
        if (step > numSteps) {
            clearInterval(interval);
            setTimeout(hideText, 500);
        }
    }, timePerStep);
}

function hideText() {
    var step = 50;
    var numSteps = 50; //Change this to set animation resolution
    var timePerStep = 3; //Change this to alter animation speed

    // set animation
    var interval = setInterval(function() {
        if (currentTriangle != null) {
            currentTriangle.setMap(null);
        }
        step--;
        mapText.style.opacity = step / numSteps;

        // break animation
        if (step < 0) {
            clearInterval(interval);
            mapText.style.display = "none";

        }
    }, timePerStep);
}



