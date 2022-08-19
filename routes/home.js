const express = require('express');
const router = express.Router();
const User = require('../models/User.js');
const lib = require('../library/lib.js');

router.get('/', (req, res) =>{
    let username = req.session.username;

    lib.getUser(username).then(user => {
        res.render('home', {
            user: user
        })
    }).catch(err => {
        res.send('oops');
    })
})

router.post('/', (req, res) =>{
    let senderUsername = req.session.username;
    let receiverUsername = req.body.friend;
    
    let addFriendMsg = ''; // The message we're going to disply after the user tries to add somebody


    if (senderUsername === receiverUsername){
        lib.getUser(senderUsername).then(user => {
            res.render('home', {
                user: user,
                addFriendMsg: `You can't add yourself`
            })
        }).catch(err => {
            res.send('oops');
        })
    }
    else{
        lib.getUser(receiverUsername).then(receiver => {   
            lib.getUser(senderUsername).then(sender => {
                if (!receiver){
                    addFriendMsg = 'That user does not exist';
                }
                else if (receiver.friendRequests.includes(senderUsername)){
                    addFriendMsg = 'You already sent a request to ' + receiverUsername;
                }
                else if (sender.friendRequests.includes(receiverUsername)){
                    addFriendMsg = 'You have a pending friend request from ' + receiverUsername;
                }
                else if (sender.friends.includes(receiverUsername)){
                    addFriendMsg = 'You and ' + receiverUsername + ' are already friends'
                }
                else{
                    addFriendMsg = `<span style = "color:green;">Sent!</span>`;
                    receiver.friendRequests.push(senderUsername);
                    receiver.notifications.push({
                        type: 'Friend Request - Received',
                        message: 'You received a friend request from ' + senderUsername,
                        time: Date.now()
                    })
                    sender.save();
                    receiver.save();
                }
                res.render('home', {
                    user: sender,
                    addFriendMsg: addFriendMsg
                })  
            })
        })
    }
});

router.put('/', (req,res) => {
    let friendRequestReceiver = req.session.username;
    let friendRequestSender = req.body.sender;
    
    let decision = req.body.decision; // accept or decline
    

    // update the sender of the friend request
    lib.getUser(friendRequestSender).then(user => {
        let status = 'declined';
        if (decision === 'accept'){
            user.friends.push(friendRequestReceiver);
            status = 'accepted';
        }
        user.notifications.push({
            type: 'Friend Request - ' + status,
            message: 'Your friend request to ' + friendRequestReceiver + ' was ' + status,
            time: Date.now()
        }) 
        user.save();
    }).catch(err => {
        console.log("Couldn't find friend request sender");
    });


    // update the receiver of the friend request and then render the page
    lib.getUser(friendRequestReceiver).then(user => {
        user.friendRequests = lib.arrayRemove(user.friendRequests, friendRequestSender);
        if (decision === 'accept'){
            user.friends.push(friendRequestSender);
        }
        user.save().then(() => {
            res.status(204).send(); // fetch ignores res.render so I just refresh on the front-end
        }).catch(err => {
            console.log('error on user.save(friendRequestReceiver)');
            console.log(err);
        });
    }).catch(err => {
        console.log("Couldn't find friend request receiver");
    }); 
})


router.post('/challenge/decline', (req,res) => {
    
    let declinerUsername = req.session.username;
    let challengerUsername = req.body.challenger;


    lib.getUser(declinerUsername).then(decliner => {
        decliner.challenges = lib.removeChallenge(decliner.challenges, challengerUsername);
        decliner.save().then(() => {
            res.redirect('/home');
        })
        
    })

    lib.getUser(challengerUsername).then(challenger => {
        challenger.notifications.push({
            type: 'Challenge - Declined',
            message: 'Your challenge to ' + declinerUsername + ' was declined',
            time: Date.now()
        })
        challenger.pendingChallenges = lib.removePendingChallenge(challenger.pendingChallenges, declinerUsername);
        challenger.save();
    })

})

router.post('/challenge/accept', (req,res) => {
    let accepterUsername = req.session.username;
    let challengerUsername = req.body.opponent;

    // challenger receives the notification, accepter has accepted your challenge
    // challenger receives an entry in activeMatches
    // accepter receives an entry in activeMatches
    // accepter gets an entry removed from challenges

    // challenger gets an entry removed from pendingChallenges
    
    lib.getUser(challengerUsername).then(challenger => {
        lib.getUser(accepterUsername).then(accepter => {
            challenger.notifications.push({
                type: 'Challenge - Accepted',
                message: 'Your challenge to ' + accepterUsername + ' was accepted, play now',
                time: Date.now()
            })


            // so we need to access the element in accepter.challenges where the username is equal to challengerUsername
            let challengerSuppliedWords = lib.getChallenge(accepter.challenges, challengerUsername).targetWords;
            let accepterSuppliedWords = [req.body.word1.toLowerCase(), req.body.word2.toLowerCase(), req.body.word3.toLowerCase(), req.body.word4.toLowerCase(), req.body.word5.toLowerCase()];


            challenger.pendingChallenges = lib.removePendingChallenge(challenger.pendingChallenges, accepterUsername);



            challenger.activeMatches.push({
                opponent: accepterUsername,
                mySuppliedWords: challengerSuppliedWords,
                opponentSuppliedWords: accepterSuppliedWords,
            })

            accepter.activeMatches.push({
                opponent: challengerUsername,
                mySuppliedWords: accepterSuppliedWords,
                opponentSuppliedWords: challengerSuppliedWords,
            })

            accepter.challenges = lib.removeChallenge(accepter.challenges, challengerUsername);


            console.log(accepter.challenges);

            challenger.save();
            accepter.save().then(() => {
                res.redirect('/home');
            })
        })
    })
})

router.post('/challenge', (req,res) => {
    let challengerUsername = req.session.username;
    let receiverUsername = req.body.opponent;

    let targetWords = [req.body.word1.toLowerCase(), req.body.word2.toLowerCase(), req.body.word3.toLowerCase(), req.body.word4.toLowerCase(), req.body.word5.toLowerCase()]

    lib.getUser(challengerUsername).then(challenger => {
        lib.removePendingChallenge(challenger.pendingChallenges, receiverUsername);
        
        let challenge = {
            challengee: receiverUsername,
            targetWords: targetWords
        }

        challenger.pendingChallenges.push(challenge);

        challenger.notifications.push({
            type: 'Challenge - Sent',
            message: 'You sent a challenge to ' + receiverUsername,
            time: Date.now()
        })
        
        challenger.save().then(() => {
            res.redirect('/home');
        })

        
    })

    lib.getUser(receiverUsername).then(receiver => {            
        // if the receiver already has a challenge from the challenger, then we want to delete that challenge
        lib.removeChallenge(receiver.challenges, challengerUsername);
        
        let challenge = {
            challenger: challengerUsername,
            targetWords: targetWords
        }

        receiver.challenges.push(challenge);

        receiver.notifications.push({
            type: 'Challenge - Received',
            message: 'You received a challenge from ' + challengerUsername,
            time: Date.now()
        })
        receiver.save();
    })
})


module.exports = router;