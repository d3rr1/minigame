var minigame = {};
minigame.main = {};

var userID;
var gameData;
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

minigame.getGameData = function(){
    //quick hack, set userid as the first ID
    userID = 'uid1';
    minigame.sendMessage({ns:'main', cmd:'getGameData', params:{userID:userID}});
}

minigame.main.ondata = function(params){
    //quick hack, exit if userid received is not the same as saved userid
    if(params.userID =! userID){
        return;
    }
    var selection = {};
    
    gameData = params.data;
    buildGameDataList('self');
    
    function buildGameDataList(type){
        $('#game').fadeOut(200, function(){
            $(this).html('');
        
        switch(type){
            case 'self':
                $('#game').append('<h3>Own Funnel Items</h3>' + 
                '<h4>Select which song to battle FOR...</h4>' +
                '<ul id="gamedata" data-role="listview">'); 
                for(var i=0; i<gameData.length;i++){
                    if(gameData[i].userID == userID){
                        $('<li pos=' + (i+1) + ' uid=' + gameData[i].userID + ' fid=' + gameData[i].funnelID + '> ' + (i+1) + ': '+ 
                        '   Added by: ' + gameData[i].userID + '    /   Title: ' + gameData[i].funnelName + '</li>').appendTo('ul#gamedata');
                    }
                };
                $('ul#gamedata li').bind('click', function(){
                    console.log($(this).attr('fid') + ' selected');
                    selection.pos = $(this).attr('pos');
                    selection.player1 = {
                        userID:$(this).attr('uid'),
                        funnelID:$(this).attr('fid')
                    }
                    console.log(selection);
                    $(this).css({'background-color':'orange'});
                    buildGameDataList('other');
                });
                break;
             case 'other':
                $('#game').append('<h3>Rest of Funnel Items</h3>' + 
                '<h4>Select which song to battle AGAINST...</h4>' +
                '<ul id="gamedata" data-role="listview">'); 
                for(var i=0; i<selection.pos;i++){
                    if(gameData[i].userID != userID){
                        $('<li uid=' + gameData[i].userID + ' fid=' + gameData[i].funnelID + '> ' + (i+1) + ': '+ 
                        '   Added by: ' + gameData[i].userID + '    /   Title: ' + gameData[i].funnelName + '</li>').appendTo('ul#gamedata');
                    }
                };
                $('ul#gamedata li').bind('click', function(){
                    console.log($(this).attr('fid') + ' selected');
                    selection.player2 = {
                        userID:$(this).attr('uid'),
                        funnelID:$(this).attr('fid')
                    }
                    delete selection.pos;
                    $(this).css({'background-color':'orange'});
                    console.log(selection);
                    buildGameDataList('opponent');
                });
                break;
             case 'opponent':
                minigame.sendMessage({ns:'main', cmd:'challenge', params:selection});
                $('#game').append('<h4>Challenging opponent...</h4>');
                break; 
                
        }
            $('#content').trigger('create');
            $('#game').fadeIn(200);
            
        }); //end callback function fadeout
    }
}


$(document).ready(function(){
    minigame.init('guest');
});
