var minigame = {};
minigame.main = {};

var gamers = [];
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

minigame.main.onconnect = function(params){
    var state = {};
    state.id = params;
    state.choice = '';
    gamers.push(state);
    console.log(gamers);
}; 

minigame.main.onchoice = function(params){
    for(var i = 0; i < gamers.length; i++){
        if(gamers[i].id == params.id){
            gamers[i].choice = params.choice;
            break;
        }
    }
    console.log(gamers);
    calcWinner();
};

calcWinner = function(){
    for(var i = 0; i<gamers.length; i++){
        if(gamers[i].choice == gamers[i+1].choice){
            //draw
            console.log('draw');
            break;
        }
        if(gamers[i].choice > gamers[i+1].choice){
            //win
            console.log('player 1 wins');
            break;
        }
        if(gamers[i].choice < gamers[i+1].choice){
            //lose
            console.log('player 2 wins');
            break;
        }
    }
}

$(document).ready(function(){
    minigame.init('host');    
});
