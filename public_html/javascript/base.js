/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

$(function() {
    $('#user_id').val(guid());
});

function login() {
    $.mobile.changePage("#choose_game_page");
}
;

function createNewGame() {
    $.mobile.changePage("#new_game_page");
}
;

function guid() {
    function s4() {
        return Math.floor((1 + Math.random()) * 0x10000)
                .toString(16)
                .substring(1);
    }
    return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
            s4() + '-' + s4() + s4() + s4();
}

$('#choose_game_page').on('pageshow', getGamesFromServer);

function getGamesFromServer() {
    
    //TODO: chane server address
    //server answer will return an json object with key=game uuid and val=game name 
    $.getJSON("ajax/test.json", function(data) {
        var items = [];
        items.push("<div id='join_game_list'>");
        $.each(data, function(key, val) {
            items.push("<button onclick=startGame('" + key + "')>" + val + "</button>");
        });
        items.push("</div>");

        $("#join_game_list").replaceWith(items.join(""));
    });
}

//this method will open a popup window that will show the game
function startGame(gameid){
    
}
