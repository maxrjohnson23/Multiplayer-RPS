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

var currentPlayer = null;

// User presence
database.ref("/.info/connected").on("value", function(snapshot) {
    if(snapshot.val()) {
        // Add new player to the database
        var playerRefKey = database.ref("/players").push();
        playerRefKey.set({id: playerRefKey.key, connected:true});
        currentPlayer = playerRefKey.key;
        // Remove player when connection ends
        playerRefKey.onDisconnect()
            .remove();
    } else {
        database.ref("/game").remove();
    }
});

// Updates to players
database.ref("/players").on("value", function(snapshot) {
    if(snapshot.numChildren() === 2) {
        startGame(snapshot.val());

    } else {
        console.log("Waiting for opponent");
    }
});

// Updates to game
database.ref("/game").on("value", function(snapshot) {
    var game = snapshot.val();
});

//
function startGame(players) {
    console.log("Starting game");
    var game = {
        players: players,
        moves: null
    };
    database.ref("/game").set(game);
}

$("#rock").on("click", function() {
    var move = {
        player: currentPlayer,
        move: "rock"
    }
    database.ref("/game/moves").push(move);
});

$("#paper").on("click", function() {
    var move = {
        player: currentPlayer,
        move: "paper"
    }
    database.ref("/game/moves").push(move);
});

$("#scissors").on("click", function() {
    var move = {
        player: currentPlayer,
        move: "scissors"
    }
    database.ref("/game/moves").push(move);
});








