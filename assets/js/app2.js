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

var userName = null;

// User presence
database.ref("/.info/connected").on("value", function(snapshot) {
    if(snapshot.val()) {
        // Add new player to the database
        // var playerRefKey = database.ref("/players").push();
        // playerRefKey.set({id: playerRefKey.key, connected:true});
        // currentPlayer = playerRefKey.key;
        //
        // // Remove player when connection ends
        // playerRefKey.onDisconnect().remove();
    } else {
        database.ref("/game").remove();
    }
});

// Updates to players
database.ref("/players").on("value", function(snapshot) {
    if(snapshot.numChildren() === 2) {
        startGame(snapshot.val());

    } else if(snapshot.numChildren() === 1) {
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

$("#move-selections").find("button").on("click", function() {
    var selection = $(this).attr("data-move");
    var move = {
        player: userName,
        move: selection
    }
    database.ref("/game/moves").push(move);
    $("#move-selections").find("button").prop("disabled",true);

});




window.onload = function() {
    $("#username-select").modal({backdrop: 'static', keyboard: false});
    $("#username-submit").on("click", function() {
        userName = $("#username-input").val();
        console.log("Setting username: " + userName);
        var playerRefKey = database.ref("/players").push();
        playerRefKey.set({userName: userName, connected:true});

        // Remove player when connection ends
        playerRefKey.onDisconnect().remove();


    });

};








