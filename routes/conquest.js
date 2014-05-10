var express = require('express');
var router = express.Router();

/* center_map
 * map_zoom
 * game_name
 * 
 * return game id
 */
router.post('/createNewGame', function(req, res) {
    // Set our internal DB variable
    var db = req.db;
    var centerMap = req.body.center_map;
    var zoomMap = req.body.map_zoom;
    var gameName = req.body.game_name;
    var user = [];
    var stakes = [];
    var triangles = [];

    // Set our collection
    var collection = db.get('gamecollection');

    collection.insert({
        "centerMap": centerMap,
	"zoomMap": zoomMap,
        "gameName": gameName,
        "user": user,
        "stakes": stakes,
        "triangles": triangles
    }, function(err, game) {
        if (err) {
            // If it failed, return error
            res.send("There was a problem adding the information to the database.");
        }
        else {
            // And forward to success page
            res.send(game._id);
        }
    });
});

/*
 *return  set of key = game id , val= game name
 */
router.post('/getGameList', function(req, res) {

    var retJson = {};

    var db = req.db;
    var collection = db.get('gamecollection');

    collection.find({}, {}, function(e, docs) {
        docs.forEach(function(entry) {
            retJson[entry._id] = entry.gameName;
        });
        res.send(retJson);
    });
});

/*
 * game_id
 * user_id
 * team => player team
 * player_name
 * pos => player position
 * 
 * return cnter of a map
 */
router.post('/joinGame', function(req, res) {

    var db = req.db;
    var gameCollection = db.get('gamecollection');
    var playerCollection = db.get('playercollection');

    gameCollection.findOne({_id: req.body.game_id}, function(e, item) {

        gameCollection.update({_id: req.body.game_id}, {$set: {maxPlayers: item.maxPlayers - 1}});
        gameCollection.update({_id: req.body.game_id}, {$addToSet: {user: req.body.user_id}});

        playerCollection.insert({
            "team": req.body.team,
            "playerName": req.body.player_name,
            "gameId": req.body.game_id,
            "pos": req.body.pos,
            "_id": req.body.user_id
        });


        var retJson = {};
        retJson["centerMap"] = item.centerMap;
        retJson["zoomMap"] = parseInt(item.zoomMap);

        res.send(retJson);
    });
});

/*
 * game_id
 * user_id
 * pos => player position
 * 
 * return list of all the players,stakes and tiangles
 */
router.post('/getGameUpdate', function(req, res) {

    var db = req.db;

    var stakCollection = db.get('stakcollection');
    var triangleCollection = db.get('trianglecollection');
    var playerCollection = db.get('playercollection');

    playerCollection.update({_id: req.body.user_id}, {$set: {pos: req.body.pos}}, function(err, result) {
        var retJson = {};

        stakCollection.find({gameId: req.body.game_id}, function(e, stakes) {
            retJson["stakes"] = stakes;

            triangleCollection.find({gameId: req.body.game_id}, function(e, triangles) {
                retJson["triangles"] = triangles;

                playerCollection.find({gameId: req.body.game_id}, function(e, players) {
                    retJson["players"] = players;

                    res.send(retJson);
                });
            });
        });
    });
});

/*
 * game_id
 * team
 * pos=> stake position
 * user_id
 * 
 * return = stake ID or new tringle msg
 */
router.post('/setStake', function(req, res) {

    var db = req.db;
    var stakCollection = db.get('stakcollection');
    var triangleCollection = db.get('trianglecollection');

    stakCollection.find({gameId: req.body.game_id, team: req.body.team}, function(e, staks) {
        if (staks.length === 2) {
            //set triangle
            triangleCollection.insert({
                "gameId": req.body.game_id,
                "team": req.body.team,
                "pos1": req.body.pos,
                "pos2": staks[0].pos,
                "pos3": staks[1].pos
            }, function(e, tringle) {
                if (e) {
                    res.send("There was a problem adding the information to the database.");
                } else {
                    //remove staks
                    stakCollection.remove({
                        gameId: req.body.game_id,
                        team: req.body.team
                    }, function(err, numberOfRemovedDocs) {
                        res.send("new tringle.");
                    });
                }
            });
        }
        else
        {
            //add stake
            stakCollection.insert({
                "gameId": req.body.game_id,
                "userId": req.body.user_id,
                "team": req.body.team,
                "pos": req.body.pos
            }, function(err, stake) {
                if (err) {
                    // If it failed, return error
                    res.send("There was a problem adding the information to the database.");
                }
                else {
                    res.send(stake._id);
                }
            });
        }
    });
});
module.exports = router;