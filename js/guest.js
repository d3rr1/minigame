var minigame = {};
minigame.main = {};

var userID = 'uid2';
var timerChallenger; //var timer for popup
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

minigame.triggerChallenger = function(accept){
    $('#popupChallenge').popup('close');
    $('#popupChallenge').remove();
    clearInterval(timerChallenger); 
    minigame.sendMessage({ns:'main',cmd:'game',params:accept});
}

minigame.main.ondata = function(params){
    //quick hack, exit if userid received is not the same as saved userid
    if(userID.localeCompare(params.userID)!=0){
        return;
    }
    
    var selection = {};
    
    var gameData = params.data;
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
                }
                
                //if user cant select any items (because for example he selected the first song), go to previous screen
                if($('ul#gamedata').children().length <= 0){
                    buildGameDataList('self');
                }
                
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
                //send selected data to host
                minigame.sendMessage({ns:'main', cmd:'challenge', params:selection});
                $('#game').append('<h4>Challenging opponent...</h4>');
                break; 
                
        }
            $('#content').trigger('create');
            $('#game').fadeIn(200);
            
        }); //end callback function fadeout
    }
}

minigame.main.onchallenge = function(params){
    //quick hack, exit if userid received is not the same as saved userid
    if(userID.localeCompare(params) != 0){
        return;
    }
    
    //build popup
    $('<div data-role="popup" id="popupChallenge">' +
	    '<p>Someone wishes to challenge you!<p>' +
	    '<div data-role="button" onclick="minigame.triggerChallenger(true)">Accept</div>' +
	    '<div data-role="button" onclick="minigame.triggerChallenger(false)">Decline</div>' +
    '</div>').appendTo('#game');
    
    $('#content').trigger('create');
    
    //hack to disable exiting popup if clicked outside the popup window
    $("#popupChallenge").on({
        popupbeforeposition: function () {
            $('.ui-popup-screen').off();
        }
    });
    
    //open popup
    $('#popupChallenge').popup('open');
    
    //start counting for accept true/false
    timerChallenger = setTimeout(function(){minigame.triggerChallenger(false)}, 5000);
}

minigame.main.ongame = function(){
    var selection = {};
    selection.player = userID;
    
    //build the Rock-Paper-Scissors screen  
     $('#game').fadeOut(200, function(){
        $(this).html('');
        $('<div id="btngrp" data-role="controlgroup" data-type="horizontal">').appendTo(this);
        $('<button id="rock">Rock</button>').click(function(e){
            applyChoice($(this));
        }).appendTo('#btngrp');
        $('<button id="paper">Paper</button>').click(function(){
            applyChoice($(this));
        }).appendTo('#btngrp');
        $('<button id="scissors">Scissors</button>').click(function(){
            applyChoice($(this));
        }).appendTo('#btngrp');
        
        $('#content').trigger('create');
        $(this).fadeIn(200);
     });
     
     var applyChoice = function(o){
        selection.choice = $(o).attr('id');
        console.log(selection);
        minigame.sendMessage({ns:'main', cmd:'choice', params:selection});
        
        $('#game').fadeOut(200, function(){
            $(this).html('');
            $('<h3>Awaiting results...</h3>').appendTo(this);
            $(this).fadeIn(200);
        });
     }
}
minigame.main.onresult = function(params){    
    for(player in params){
        if(userID.localeCompare(params[player].userID) == 0){
            //winstate, 0=draw, 1=win, 2=lost
            switch(params[player].win){
                case 0:
                    $('#game').fadeOut(200, function(){
                        $(this).html('');
                        $('<h3>It is a draw!</h3>').appendTo(this);
                        $(this).fadeIn(200);
                    });
                    break;
                case 1:
                    $('#game').fadeOut(200, function(){
                        $(this).html('');
                        $('<h3>Congratulations... you won!</h3>').appendTo(this);
                        $(this).fadeIn(200);
                    });
                    break;
                case 2:
                    $('#game').fadeOut(200, function(){
                        $(this).html('');
                        $('<h3>You lost!</h3>').appendTo(this);
                        $(this).fadeIn(200);
                    });
                    break;                    
            }
        }
    }
}

$(document).ready(function(){ 
    minigame.init('guest');
});
