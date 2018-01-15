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
        startGame();

    } else if (snapshot.numChildren() === 1) {
        $("#opponent-title").text("Waiting...");
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
        var img = $('<img />', {
            src: `assets/images/${opponentMove}.png`,
            alt: opponentMove
        });
        // Update opponent image
        $("#opponent-selection").html(img);
        // Update opponent text
        $("#opponent-text").text(opponentMove);

        let outcome = calculateWinner(playerMove, opponentMove);
        if (outcome > 0) {
            userWins++;
            // Update score in database
            database.ref("/game/" + userName + "/score").set(userWins);
        }
        database.ref("/game/moves/" + userName).remove();
        setTimeout(function () {
            // Clear images
            $(".move-display").empty();
            // Unlock buttons
            $("#move-selections").find("button").prop("disabled", false);
            $("#opponent-text").empty();

        }, 2000);
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

// Get scores
database.ref("/game/").on("child_changed", function (snapshot) {
    console.log("Child changed");
    console.log(snapshot.val());
    console.log(snapshot.key);
    if (snapshot.val().score) {
        var winner = snapshot.key;
        if (winner === userName) {
            $("#player-wins").text(snapshot.val().score);
        } else {
            $("#opponent-wins").text(snapshot.val().score);
        }
    }

})

//
function startGame() {
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
    let img = $('<img />', {
        src: `assets/images/${selection}.png`,
        alt: selection
    });
    $("#player-selection").html(img);
    $("#move-selections").find("button").prop("disabled", true);
    database.ref("/game/moves/" + userName).set({move: selection});

});

function calculateWinner(move1, move2) {
    let choices = ["rock", "paper", "scissors"];
    var moveNum1 = choices.indexOf(move1);
    let moveNum2 = choices.indexOf(move2);

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

$("#send-button").on("click", function() {
    var message = $("#message").val();
    $("#message").val("");
    addMessageToDB(userName, message);
});

$('#message').keypress(function(e){
    if(e.which == 13){//Enter key pressed
        $('#send-button').click();//Trigger search button click event
    }
});


function addMessageToDB(user, message) {
    database.ref("/chat").push({user: user, message: message});
}

database.ref("/chat").on("child_added", function(snapshot) {
    var message = snapshot.val();
    appendMessage(message.user, message.message)
});

function appendMessage(id, message) {
    var p = $("<p>");
    p.text(`${id}: ${message}`);
    p.addClass("chat-message");
    if(id !== userName) {
        p.css("text-align", "right");
    }
    var $chatWindow = $("#chat-window");
    $chatWindow.append(p);
    $chatWindow.prop("scrollTop", $chatWindow.prop("scrollHeight"));

}


window.onload = function () {
    $("#username-select").modal({backdrop: 'static', keyboard: false});
    $("#username-submit").on("click", function () {
        userName = $("#username-input").val();
        console.log("Setting username: " + userName);
        $("#player-title").text(userName);
        let playerRefKey = database.ref("/players").push();
        playerRefKey.set({userName: userName, connected: true});
        playerKey = playerRefKey.key;

        // Remove player when connection ends
        playerRefKey.onDisconnect().remove();
    });

};








