const express = require('express');
const router = express.Router();
const lib = require('../library/lib.js');
const User = require('../models/User.js');


router.get('/', (req, res) =>{
    res.render('game');
});

// add trial to database
router.post('/', (req, res) => {
    // the user is the one who made the trial, the opponent is the one who needs to be updated about it
   
    lib.getUser(req.session.username).then(user => {
        if (req.body.opponent && req.body.opponent !== 'normal' && req.body.opponent !== 'god'){
            lib.getUser(req.body.opponent).then(opponent => {
                // get the active match between the opponent and the user
                let oppMatch = lib.getMatch(opponent.activeMatches, req.session.username);
                oppMatch.opponentTrials.push(req.body);

                let userMatch = lib.getMatch(user.activeMatches, req.body.opponent);
                userMatch.myTrials.push(req.body);
                
                if (userMatch.myTrials.length === 5 && userMatch.opponentTrials.length === 5){
                    lib.endMatch(user, opponent, userMatch, oppMatch);
                }
                
                user.trials.push(req.body); // I know we're repeating code but async js makes everything harder

                opponent.save();
                user.save();
            })   
        }
        else{
            if (req.body.opponent === 'normal'){
                user.normalTrials.push(req.body);
            }
            else if (req.body.opponent === 'god'){
                user.godTrials.push(req.body);
            }
            user.trials.push(req.body);
            user.save();
        }
        
        
    })
});


module.exports = router;