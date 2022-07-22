function activeGame(user, friend){
    for (game of user.activeMatches){
        if (game.opponent === friend){
            return true;
        }
    }
    return false;
}

function isChallenge(user, friend){
    for (challenge of user.challenges){
        if (challenge.challenger === friend){
            return true;
        }
    }
    return false;
}

function listToString(list){
    console.log(list);
    return poop;
}

let functions = {
    activeGame: activeGame,
    isChallenge, isChallenge,
    listToString, listToString
}

module.exports = functions;