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
// Store global database variable
var database = firebase.database();

var userName = null;

// User presence
database.ref("/.info/connected").on("value", function (snapshot) {
    if (!snapshot.val()) {
        database.ref("/game").remove();

    }
});

// Updates to players
database.ref("/players").on("value", function (snapshot) {
    var players = snapshot.val();
    if (snapshot.numChildren() === 2) {
        var opponentName = "";
        Object.keys(players)
            .forEach(function eachKey(key) {
                if (players[key].userName !== userName) {
                    opponentName =  players[key].userName;
                }
            });
        $("#opponent-title").text(opponentName);
        startGame(players);

    } else if (snapshot.numChildren() === 1) {
        console.log("Waiting for opponent");
    }
});

// Updates to game moves
database.ref("/game/moves").on("value", function (snapshot) {
    var moves = snapshot.val();
    if(snapshot.numChildren() === 2) {

        var playerMove = null;
        var opponentMove = null;
        Object.keys(moves)
            .forEach(function eachKey(key) {
                if (moves[key].userName === userName) {
                    playerMove = moves[key].move;
                } else {
                    opponentMove = moves[key].move;

                }
            });

        console.log("Player: " + playerMove);
        console.log("Opponent: " + opponentMove);
        var outcome = calculateWinner(playerMove, opponentMove);
        console.log("Outcome: " + outcome);
    }


})
;

// Updates to game
database.ref("/game").on("value", function (snapshot) {
    if (!snapshot.val()) {
        // reset game
        $("#move-selections").find("button").prop("disabled", false);
    }
});

//
function startGame(players) {
    console.log("Starting game");
    let game = {
        players: players,
        moves: null
    };
    database.ref("/game").set(game);
}

$("#move-selections").find("button").on("click", function () {
    let selection = $(this).attr("data-move");
    let move = {
        userName: userName,
        move: selection
    };
    database.ref("/game/moves").push(move);
    $("#move-selections").find("button").prop("disabled", true);

});

function calculateWinner(move1, move2) {
    var choices = ["rock", "paper", "scissors"];
    var moveNum1 = choices.indexOf(move1);
    var moveNum2 = choices.indexOf(move2);

    if (moveNum1 === moveNum2) {
        return -1;
    }
    else if ((moveNum1 - moveNum2 + 3) % 3 === 1) {
        return 0;
    }
    else {
        return 1;
    }
}


window.onload = function () {
    $("#username-select").modal({backdrop: 'static', keyboard: false});
    $("#username-submit").on("click", function () {
        userName = $("#username-input").val();
        console.log("Setting username: " + userName);
        $("#player-title").text(userName);
        var playerRefKey = database.ref("/players").push();
        playerRefKey.set({userName: userName, connected: true});

        // Remove player when connection ends
        playerRefKey.onDisconnect().remove();
    });

};








