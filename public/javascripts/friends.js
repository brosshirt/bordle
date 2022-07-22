function handleFriendRequest(sender, decision){
    fetch('/friends', {
        method: "PUT",
        body: JSON.stringify({ 
            sender: sender,
            decision: decision
         }),
        headers: {
            "Content-type": "application/json; charset=UTF-8"
        }
    }).then(res => {
        document.location.reload()
    })
}
function challengeFriend(friend){
    let wordsForm = document.querySelector('.words-form.'+friend);
    wordsForm.style.visibility = 'visible';
}

function acceptChallenge(friend){
    let wordsForm = document.querySelector('.return-words.'+friend);
    wordsForm.style.visibility = 'visible';
}

function renderGame(opponent, targetWord){
    // ok now we need to render a game where opponent is equal to opponent and targetWord is equal to opponent
    // let's use session storage

    sessionStorage.setItem('opponent', opponent);
    sessionStorage.setItem('targetWord', targetWord);

    window.location.href = '/game';
}

