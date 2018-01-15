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
var playerKey = null;
var opponentName = null;
var userWins = 0;

// User presence
database.ref("/.info/connected").on("value", function (snapshot) {
    if (!snapshot.val()) {
        database.ref("/game").remove();

    }
});

// Updates to players
database.ref("/players").on("value", function (snapshot) {
    let players = snapshot.val();
    if (snapshot.numChildren() === 2) {
        var opponentKey = Object.keys(players).find(function (key) {
            return players[key].userName !== userName
        });
        opponentName = players[opponentKey].userName;
        $("#opponent-title").text(opponentName);
        startGame(players);

    } else if (snapshot.numChildren() === 1) {
        console.log("Waiting for opponent");
    }
});

// Updates to game moves
database.ref("/game/moves").on("value", function (snapshot) {
    console.log("Move updated");
    var moves = snapshot.val();
    if (snapshot.numChildren() === 2) {
        console.log("2 Moves");

        let playerMove = moves[userName].move;
        let opponentMove = moves[opponentName].move;

        console.log("Player: " + playerMove);
        console.log("Opponent: " + opponentMove);
        let outcome = calculateWinner(playerMove, opponentMove);
        $("#move-selections").find("button").prop("disabled", false);
        if (outcome > 0) {
            console.log("Win!");
            userWins++;
            database.ref("/game/" + userName + "/score").set(userWins);
        }
        database.ref("/game/moves/" + userName).remove();
        console.log("Unlock game");


    }


});

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
        moves: null,
        score: 0
    };
    database.ref("/game/" + userName).set(game);
}

$("#move-selections").find("button").on("click", function () {
    let selection = $(this).attr("data-move");
    console.log("Clicked: " + selection);
    // let move = {
    //     move: selection
    // };
    $("#move-selections").find("button").prop("disabled", true);
    database.ref("/game/moves/" + userName).set({move: selection});

});

function calculateWinner(move1, move2) {
    var choices = ["rock", "paper", "scissors"];
    var moveNum1 = choices.indexOf(move1);
    var moveNum2 = choices.indexOf(move2);

    if (moveNum1 === moveNum2) {
        return -1;
    }
    else if ((moveNum1 - moveNum2 + 3) % 3 === 1) {
        return 1;
    }
    else {
        return 0;
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
        playerKey = playerRefKey.key;

        // Remove player when connection ends
        playerRefKey.onDisconnect().remove();
    });

};








