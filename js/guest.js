var minigame = {};
minigame.main = {};

var gamer = {};
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

var setupGuest = {
    init : function(){
        $('<li id="john">JOHN</li><li id="jane">JANE</li>').appendTo('#guest ul');
        $('#guest ul li').bind('click', setupGuest.connect);
    },
    connect : function(e){
        id = $(this).attr('id');
        gamer.id = id;
        minigame.sendMessage({ns:'main', cmd:'connect', params:id});
        $('#guest').fadeOut(200, function(){
            setupGame.init();
        });
    }
};

var setupGame = {
    init : function(){
        $('#game').show();
        $('<li id="1">ROCK</li>' + 
        '<li id="2">PAPER</li>' +
        '<li id="3">SCISSORS</li>').appendTo('#game ul');
        $('#game ul li').bind('click', setupGame.choice);
    },
    choice : function(){
        id = $(this).attr('id');
        gamer.choice = id;
        minigame.sendMessage({ns:'main', cmd:'choice', params:{id:gamer.id,choice:gamer.choice}});
        $('#game').fadeOut(200, function(){
            $('#result').html('<h2>Awating results...</h2>');
        });
    }
};

minigame.main.onresult = function(params){
    
}

$(document).ready(function(){
    minigame.init('guest');
    setupGuest.init();
});
