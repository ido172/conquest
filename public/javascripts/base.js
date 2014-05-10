var SERVER_URL = "/conquest/";
var userName = "";
var userID = "";
var userTeam = "";


function guid() {
    function s4() {
        return Math.floor((1 + Math.random()) * 0x10000)
                .toString(16)
                .substring(1);
    }
    return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
            s4() + '-' + s4() + s4() + s4();
}

$(document).ready(function(){
	window.scrollTo(0,1);
	$('#user_id').val(guid());
        $('#choose_game_page').on('pageshow', getGamesFromServer); 
	$('#game_page').on('pageshow', initializeGameMap);
});

function login() {
    userName = $("#user_name").val();
    if (/\S/.test(userName)) {
        userTeam = $("#create_game_team :radio:checked").val();
        userID = $('#user_id').val();
        $.mobile.changePage("#choose_game_page");
    } else {
        alert("Please Enter A Name");
    }    
};

function getGamesFromServer() {
    $.post("conquest/getGameList", function(data) {
        var items = [];
        items.push("<div id='join_game_list'>");
        $.each(data, function(key, val) {
            items.push("<button class='ui-btn ui-shadow ui-corner-all' onclick=joinGame('" + key + "')>" + val + "</button>");
        });
        items.push("</div>");

        $("#join_game_list").replaceWith(items.join(""));
    });
}

//this method will open a popup window that will show the game
function joinGame(gameid){
    //alert("joinGame");
    currentGameID = gameid;
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function(position) {
            var pos = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);		
            var data = {
                team: userTeam,
                player_name: userName,
                user_id: userID,
                game_id: currentGameID,
                pos: JSON.stringify(pos)
            };
            post('joinGame', data, startGame);
            
        }, function() {

        });
     }
}

 function post(method, myData, onSuccess) {
    //alert("post " + method + myData);
    $.ajax({
            url: SERVER_URL + method,
            method: 'POST',
            data: myData,
            success: function (resData) {			
                onSuccess(resData);
            },
            error: function () {
              alert("server error");
            }
     });
 }
 
 



