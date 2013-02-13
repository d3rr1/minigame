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

var selectedData;


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

minigame.calcWinner = function(){
    console.log('calculating winner with...');
    console.log(selectedData);
    
    var p1choice = selectedData.player1.choice;
    var p2choice = selectedData.player2.choice;
    
    //win true/false, will be set in the switch/case
    var endResult = {
        player1 : {
            userID : selectedData.player1.userID,
            win : ''
        },
        player2 : {  
            userID : selectedData.player2.userID,
            win : ''
        }
    };
    
    //rock=1, paper=2, scissors=3
    //0=draw, 1=win, 2=lost
    switch(p1choice){
        case 1:
            if(p1choice == p2choice){
                endResult.player1.win=0;
                endResult.player2.win=0;
            } else if(p1choice < p2choice){
                if(p2choice == 2){
                    endResult.player1.win=2;
                    endResult.player2.win=1;
                } else if(p2choice==3){
                    endResult.player1.win=1;
                    endResult.player2.win=2;
                }   
            }
            break;
        case 2:
            if(p1choice == p2choice){
                endResult.player1.win=0;
                endResult.player2.win=0;
            } else if(p1choice < p2choice){
                endResult.player1.win=2;
                endResult.player2.win=1;
            } else if(p1choice > p2choice){
                endResult.player1.win=1;
                endResult.player2.win=2;
            }
            break;
        case 3:
            if(p1choice == p2choice){
                endResult.player1.win=0;
                endResult.player2.win=0;
            } else if(p1choice > p2choice){
                if(p2choice == 2){
                    endResult.player1.win=1;
                    endResult.player2.win=2;
                } else if(p2choice==1){
                    endResult.player1.win=2;
                    endResult.player2.win=1;
                }   
            }
            break;
    }
    
    //if player1 won switch funnelItems
    if(endResult.player1.win == 1){
        minigame.switchItem();
    }
    minigame.sendMessage({ns:'main', cmd:'result', params:endResult});
}

minigame.switchItem = function(){
    var index1, index2, item1, item2;
    for(var i = 0; i<gameData.length;i++){
        if(gameData[i].funnelID == selectedData.player1.funnelID){
            index1 = i;
            item1 = gameData[i];
        }
        if(gameData[i].funnelID == selectedData.player2.funnelID){
            index2 = i;
            item2 = gameData[i];
        }
    }
    gameData[index2] = item1;
    gameData[index1] = item2;
        
}

minigame.main.ongetGameData = function(params){
    minigame.sendMessage({ns:'main', cmd:'data', params:{data:gameData, userID:params.userID}});
}

minigame.main.onchallenge = function(params){
    selectedData = params;
    minigame.sendMessage({ns:'main', cmd:'challenge', params:params.player2.userID});
}

minigame.main.ongame = function(params){
    //params = accepted: true/false by player2
    //console.log(selectedData);
    switch(params){
        case true:
            console.log('player2 accepted the challenge');
            minigame.sendMessage({ns:'main', cmd:'game'});
            break;
        case false:
            console.log('player2 declined the challenge');
                                                                    //winstate, 0=draw, 1=win, 2=lost
            minigame.sendMessage({ns:'main', cmd:'result', params:{player1:{userID:selectedData.player1.userID,win:1},
                                                                   player2:{userID:selectedData.player2.userID,win:2}}});
            minigame.switchItem();
            break;
    }
}

minigame.main.onchoice = function(params){
    //console.log(params);
    
    //set choice for correct player
    for(player in selectedData){
        if((selectedData[player].userID).localeCompare(params.player) == 0){
            //already convert the choice strings to number for easier comparison
            //rock=1, paper=2, scissors=3
            switch(params.choice){
                case 'rock':
                    selectedData[player].choice = 1;
                    break;
                case 'paper':
                    selectedData[player].choice = 2;
                    break;
                case 'scissors':
                    selectedData[player].choice = 3;
                    break;
            }
        }
    }
    
    for(player in selectedData){
        if(selectedData[player].hasOwnProperty('choice')){
            console.log(selectedData[player].userID + ' has made a choice: ' + selectedData[player].choice);
        } else {
            console.log(selectedData[player].userID + ' has NOT made a choice, exiting...');
            return;
        }
    }
    
    minigame.calcWinner();
}

$(document).ready(function(){
    minigame.init('host');    
});
