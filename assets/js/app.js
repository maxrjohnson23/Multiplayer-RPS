// Initialize Firebase
var config = {
    apiKey: "AIzaSyAFCI1LBk7YQ6kWN5mXrv4FOCm4b_sBaxk",
    authDomain: "multiplayer-rps-7ad91.firebaseapp.com",
    databaseURL: "https://multiplayer-rps-7ad91.firebaseio.com",
    projectId: "multiplayer-rps-7ad91",
    storageBucket: "multiplayer-rps-7ad91.appspot.com",
    messagingSenderId: "892854720255"
};
firebase.initializeApp(config);
// Store global database variable for firebase
var database = firebase.database();




// Game logic object and functions
var game = {
    player1:null,
    player2:null,
    playerList: [],
    updateGame: function(game) {

    },
    createGame: function() {
        var newGame = {
            state: "started",
            player1: game.player1,
            player2: game.player2
        };
        dataHandler.createGame(newGame);
    },
    resetGame: function() {
        dataHandler.gameRef.remove();
    }
};

// Chat functions
var chat =  {
    appendMessage: function(id, message) {
        var p = $("<p>");
        p.text(`${id}: ${message}`);
        if(id !== game.player1.id) {
            p.css("text-align", "right");
        }
        $("#chat-window").append(p);
    },
    registerChatSendButton: function() {
        $("#send-button").on("click", function() {
            var message = $("#message").val();
            dataHandler.addMessage(game.player1.id, message);
        })
    },
    resetChat: function() {
        dataHandler.chatRef.remove();
    }

}

// Object for handling firebase interactions
var dataHandler = {
    // Database references
    playersRef: database.ref("/players"),
    chatRef: database.ref("/chat"),
    gameRef: database.ref("/GAME"),
    gameCreated: false,
    currentPlayerKey: null,
    registerUserPresence: function() {
        // Register connect/disconnect events
        database.ref("/.info/connected").on("value", function(snapshot) {
            if(snapshot.val()) {
                // Add new player to the database
                var playerRefKey = dataHandler.playersRef.push();
                dataHandler.currentPlayerKey = playerRefKey.key;
                playerRefKey.set({id: dataHandler.currentPlayerKey, connected:true});
                // Remove player when connection ends
                playerRefKey.onDisconnect()
                    .remove();
            } else {
                // clear chat on exit
                chat.resetChat();
                game.resetGame();

            }
        })
    },
    registerPlayerAdded: function() {
        dataHandler.playersRef.on("child_added", function(snapshot) {
            var player = snapshot.val();
            if(!gameCreated) {
                if(player.id == dataHandler.currentPlayerKey) {
                    dataHandler.gameCreated = true;
                }
                console.log("creating GAME");
                dataHandler.createGame(player);
            } else {
                console.log("adding to GAME");
                dataHandler.addPlayerToGame();
            }
            dataHandler.addPlayerToGame(player);
        });
    },
    registerGameUpdated: function() {
        dataHandler.gameRef.on("value", function(snapshot) {

        });
    },
    registerChat: function() {
        dataHandler.chatRef.on("child_added", function(snapshot) {
            var message = snapshot.val();
            chat.appendMessage(message.user, message.message)
        });
    },
    addMessage: function(user, message) {
        dataHandler.chatRef.push({user: user, message: message});
    },
    createGame: function(player) {
        var game = {
            state: "started",
            players: player
        };
        dataHandler.gameRef.set(game);
    },
    addPlayerToGame: function(player) {

        dataHandler.gameRef.child("players").push(player);
    }
};

// Screen object for handling UI components
var screen = {
    showWaitingMessage: function() {
        $("#opponent-selection").text("Waiting for opponent");
    },
    hideWaitingMessage: function() {
        $("#opponent-selection").text("Opponent joined");
    }
};


// Application startup
window.onload = function() {
    // Register firebase event handlers
    dataHandler.registerUserPresence();
    dataHandler.registerPlayerAdded();
    dataHandler.registerChat();
    dataHandler.registerGameUpdated();

    // Register UI events
    chat.registerChatSendButton();

};


