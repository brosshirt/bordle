const express = require('express');
const router = express.Router();
const lib = require('../library/lib.js');
const User = require('../models/User.js');


router.get('/', (req, res) =>{

    // So we need to get the users friend list and friend request list and throw it in an object when we render

    let username = req.session.username;

    lib.getUser(username).then(user => {
        res.render('friends', {
            user: user
        })
    }).catch(err => {
        res.send('oops');
    })
});

router.post('/', (req, res) =>{
    let senderUsername = req.session.username;
    let receiverUsername = req.body.friend;
    
    let addFriendMsg = ''; // The message we're going to disply after the user tries to add somebody


    if (senderUsername === receiverUsername){
        lib.getUser(senderUsername).then(user => {
            res.render('friends', {
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
                    receiver.friendRequests.push(senderUsername);
                    receiver.notifications.push({
                        type: 'Friend Request - Received',
                        message: 'You received a friend request from ' + senderUsername,
                        time: Date.now()
                    })
                    sender.save();
                    receiver.save();
                }
                res.render('friends', {
                    user: sender,
                    addFriendMsg: addFriendMsg
                })  
            })
        })
    }
});
// this handles accepting and declining friend requests
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


router.post('/challenge', (req,res) => {
    let challengerUsername = req.session.username;
    let receiverUsername = req.body.opponent;

    lib.getUser(challengerUsername).then(challenger => {
        lib.getUser(receiverUsername).then(receiver => {    
            
            let challenge = {
                challenger: challengerUsername,
                targetWords: [req.body.word1, req.body.word2, req.body.word3, req.body.word4, req.body.word5]
            }

            receiver.challenges.push(challenge);

            receiver.notifications.push({
                type: 'Challenge - Received',
                message: 'You received a challenge from ' + challengerUsername,
                time: Date.now()
            })

            receiver.save();
        }).catch(err => {
            console.log('ERROR GETTING RECEIVER - RECEIVER SHOULD BE ' + receiverUsername);
        })
        res.render('friends', {
            user: challenger
        })
    }).catch(err => {
        res.send('oops');
    })
})
// this should create an active challenge for both the receiver and the sender
router.post('/challenge/accept', (req,res) => {
    let accepterUsername = req.session.username;
    let challengerUsername = req.body.opponent;

    console.log(accepterUsername + ' accepts the challenge from ' + challengerUsername);

    // challenger receives the notification, accepter has accepted your challenge
    // challenger receives an entry in activeMatches
    // accepter receives an entry in activeMatches
    // accepter gets an entry removed from challenges
    
    lib.getUser(challengerUsername).then(challenger => {
        lib.getUser(accepterUsername).then(accepter => {
            challenger.notifications.push({
                type: 'Challenge - Accepted',
                message: 'Your challenge to ' + accepterUsername + ' was accepted, play now',
                time: Date.now()
            })

            // so we need to access the element in accepter.challenges where the username is equal to challengerUsername
            let challengerSuppliedWords = lib.getChallenge(accepter.challenges, challengerUsername).targetWords;
            let accepterSuppliedWords = [req.body.word1, req.body.word2, req.body.word3, req.body.word4, req.body.word5];


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
            accepter.save();

            res.render('friends', {
                user: accepter
            })
        })
    })
})




module.exports = router;