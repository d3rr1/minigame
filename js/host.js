var minigame = {};
minigame.main = {};

var gameData = [
    item = {userID:'uid1', funnelID:'fid1', funnelName:'song1'},
    item = {userID:'uid2', funnelID:'fid3', funnelName:'song3'},
    item = {userID:'uid2', funnelID:'fid4', funnelName:'song4'},
    item = {userID:'uid3', funnelID:'fid5', funnelName:'song5'},
    item = {userID:'uid1', funnelID:'fid2', funnelName:'song2'},
    item = {userID:'uid3', funnelID:'fid6', funnelName:'song6'},
    item = {userID:'uid1', funnelID:'fid7', funnelName:'song7'},
    item = {userID:'uid1', funnelID:'fid8', funnelName:'song8'},
];


/**
 * Initialises the websocket and set up the communication protocol
 * @param hostorguest either 'host' or 'guest', relevant for a2a-stub behaveour
 */ 
minigame.init = function(hostorguest) {
    var channel;
                            //to make it work for mobiles, change 'localhost' to ip adress
    webinos.app2app.init('ws:localhost:10666/' + hostorguest, function() {
        log('Connected to a2a stub server (as ' + hostorguest + ')');

        channel = webinos.app2app.createChannel(
            'minigame', null, null, function(msg, key) {
                var func, handler;
                if (msg.ns in minigame) {
                    handler = 'on' + msg.cmd;
                    if (handler in minigame[msg.ns]) {
                        func = minigame[msg.ns][handler];
                    }
                }
                if (typeof func === 'function') {
                    func(msg.params, msg.ref, key);
                } else {
                    log('Can\'t find handler minigame.' + msg.ns + '.on' + msg.cmd);
                }
        });

        minigame.sendMessage = function(msg, key) {
            channel.send(msg, key);
        };
    });
}

minigame.main.ongetGameData = function(params){
    minigame.sendMessage({ns:'main', cmd:'data', params:{data:gameData, userID:params.userID}});
}


$(document).ready(function(){
    minigame.init('host');    
});
