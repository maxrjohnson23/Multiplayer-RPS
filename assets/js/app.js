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
    addPlayer: function(newPlayer) {
        if(!this.player1) {
            this.player1 = newPlayer;
            screenHandler.showWaitingMessage();
        } else {
            this.player2 = newPlayer;
            screenHandler.hideWaitingMessage();
        }

    }
};

// Object for handling firebase interactions
var dataHandler = {
    // Database references
    playersRef: database.ref("/players"),
    registerUserPresence: function() {
        // Register connect/disconnect events
        database.ref("/.info/connected").on("value", function(snapshot) {
            if(snapshot.val()) {
                // Add new player to the database
                var playerRefKey = dataHandler.playersRef.push({connected:true});
                // Remove player when connection ends
                playerRefKey.onDisconnect()
                    .remove();
            }
        })
    },
    registerPlayerAdded: function() {
        dataHandler.playersRef.on("child_added", function(snapshot) {
            game.addPlayer(snapshot.val());
        });
    }
};

// Register firebase event handlers
dataHandler.registerUserPresence();
dataHandler.registerPlayerAdded();



// Screen handler object for managing UI updates
var screenHandler = {
    showWaitingMessage: function() {
        $("#opponent-selection").text("Waiting for opponent");
    },
    hideWaitingMessage: function() {
        $("#opponent-selection").text("Opponent joined");
    }
};


