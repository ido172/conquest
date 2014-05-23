var WIN_METER = 15;
//google.maps.geometry
var currentGameID;
var map;
var blueStakeList = [];
var redStakeList = [];
var redTriangleCounter = 0;
var blueTriangleCounter = 0;
var currentTriangle;
var currentLine;
var mapText;
var isAnimatedTrianle = false;
var gameInitData;
var gameData;
var socket;
var isSendingStakeFlag = true;
//-------------------------

function startGame(gameData) {

	

    gameInitData = gameData;
	WIN_METER = gameInitData.totalArea / 4;
    gameInitData.centerMap = JSON.parse(gameData.centerMap);
    $.mobile.changePage("#game_page");

    //
    socket = io.connect('/');
    socket.on('newConnection', function(data) {
        socket.emit('myGameID', {id: currentGameID});
    });
    socket.on('newStake', function(data) {
        drawStake(data);
    });
    socket.on('victory', function(data) {
        victory(data);
    });
}


function initializeGameMap() {
    //alert("initializeGameMap");
	$.mobile.loading( 'show' );;
    gameData = {};
    gameData.players = [];
    gameData.stakes = [];
    gameData.triangles = [];
    gameData.allDrawing = [];
	blueStakeList = [];
	redStakeList = [];
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

    updateGame();
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

function sendStakeButton() {
	if (isSendingStakeFlag == true) {
		return;
	}
	
    if (navigator.geolocation) {
		$.mobile.loading( 'show' );
		isSendingStakeFlag = true;
        navigator.geolocation.getCurrentPosition(function(position) {
            var pos = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
			var object = {latLng: pos};
			sendStake(object);
        }, function() {
			isSendingStakeFlag = false;
			$.mobile.loading( 'hide' );
            handleNoGeolocation(true);
        }, {enableHighAccuracy: true} );
    } else {
        // Browser doesn't support Geolocation
        handleNoGeolocation(false);
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
    socket.emit('setStake', data);
	$.mobile.loading( 'hide' );;
	isSendingStakeFlag = false;
    post('setStake', data, function() {});
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
        
        
        if (data.stakes[i].team === "red") {
            redStakeList.push(marker);
        } else {
            blueStakeList.push(marker);
        }
    }
    
    if (redStakeList.length == 2) {
        var line = new google.maps.Polyline({
            strokeColor: "red",
            strokeWeight: 1.5,
            geodesic: true, //set to false if you want straight line instead of arc
            path: [redStakeList[0].position, redStakeList[1].position],
            map: map
        });
    }
    
    if (blueStakeList.length == 2) {
        var line = new google.maps.Polyline({
            strokeColor: "blue",
            strokeOpacity: 1,
            strokeWeight: 1.5,
            geodesic: true, //set to false if you want straight line instead of arc
            path: [blueStakeList[0].position, blueStakeList[1].position],
            map: map
        });
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
		var areaOfTriangle = google.maps.geometry.spherical.computeArea(triangle.getPath());
        if (data.triangles[i].team === "red") {
            redTriangleCounter += areaOfTriangle;
        } else {
            blueTriangleCounter += areaOfTriangle;
        }
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
	 
	isSendingStakeFlag = false;
	$.mobile.loading( 'hide' );
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


function victory(data) {
    //clearListeners(map, 'click');
    showText(data.victory.toUpperCase() + " TEAM WINS!!", false);
}
//------------------------








function drawStake(data) {
    if (isAnimatedTrianle)
        return;
    var pos = JSON.parse(data.pos);
    var image = 'images/' + data.team + '_flag_small.png';
    var marker = new google.maps.Marker({
        position: new google.maps.LatLng(pos.k, pos.A),
        map: map,
        icon: image
    });
    var currentStakeList;
    var currentColor = data.team;
    if (currentColor === "red") {
        redStakeList.push(marker);
        currentStakeList = redStakeList;
    } else{
        blueStakeList.push(marker);
        currentStakeList = blueStakeList;
    }
    
    if (currentStakeList.length == 2) {
        //isAnimatedTrianle = true;
        animateLine(0, 1, false, currentStakeList, currentColor);
    } else if (currentStakeList.length == 3) {
        //isAnimatedTrianle = true;
        animateLine(1, 2, false, currentStakeList, currentColor);
    }
};

function animateLine(i, j, stopflag, stakeList, color) {
    var step = 0;
    var numSteps = 50; //Change this to set animation resolution
    var timePerStep = 3; //Change this to alter animation speed
    var interval = setInterval(function() {
        if (currentLine != null) {
            currentLine.setMap(null);
        }
        step++;
        currentLine = new google.maps.Polyline({
            strokeColor: color,
            strokeOpacity: step / numSteps,
            strokeWeight: 1.5,
            geodesic: true, //set to false if you want straight line instead of arc
        });

        var are_we_there_yet = google.maps.geometry.spherical.interpolate(stakeList[i].position, stakeList[j].position, step / numSteps);
        currentLine.setPath([stakeList[i].position, are_we_there_yet]);
        currentLine.setMap(map);

        if (step > numSteps) {
            clearInterval(interval);
            currentLine = null;
            if (stakeList.length == 3 && stopflag == false) {
                animateLine(2, 0, true, stakeList, color);
            } else if (stopflag == true) {
                animateTrianle(stakeList, color);
            } else {
                isAnimatedTrianle = false;
            }
        }
    }, timePerStep);
}

function animateTrianle(stakeList, color) {

    var step = 0;
    var numSteps = 50; //Change this to set animation resolution
    var timePerStep = 3; //Change this to alter animation speed

    // set animation
    var interval = setInterval(function() {
        if (currentTriangle != null) {
            currentTriangle.setMap(null);
        }
        step++;
		var path = [stakeList[0].position, stakeList[1].position, stakeList[2].position];
        currentTriangle = new google.maps.Polygon({
            paths: path,
            strokeColor: color,
            strokeOpacity: 1,
            strokeWeight: 2.5,
            fillColor: color,
            fillOpacity: step / 150,
        });
        currentTriangle.setMap(map);

        // break animation
        if (step > numSteps) {
            clearInterval(interval);
            for (var i = 0; i < stakeList.length; i++) {
                stakeList[i].setMap(null);
            }
            
			var areaOfTriangle = google.maps.geometry.spherical.computeArea(currentTriangle.getPath());
			currentTriangle = null;
            if (color === "red") {
                redTriangleCounter += areaOfTriangle;
                redStakeList = [];        
            } else {
                blueStakeList = [];
                blueTriangleCounter += areaOfTriangle;
            }
            
            isAnimatedTrianle = false;
            if (redTriangleCounter >= WIN_METER) {
                socket.emit("victory", { victory: "red",game_id:currentGameID});
            } else if (blueTriangleCounter >= WIN_METER) {
                socket.emit("victory", { victory: "blue",game_id:currentGameID});
            } else {
                showText("TRIANGLE CAPTURED!!", true);
            }
            
        }
    }, timePerStep);
}

function showText(text, hideTextAfterrShow) {
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
            if (hideTextAfterrShow) {
                setTimeout(hideText, 500);
            }
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
