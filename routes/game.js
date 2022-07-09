const express = require('express');
const router = express.Router();
const myLib = require('../library/myLib.js');
const User = require('../models/User.js');


router.get('/', (req, res) =>{
    console.log(req.session.username);
    res.render('game');
});

// add trial to database
router.post('/', (req, res) => {
    User.findOne({username: req.session.username}).then((user) => {
        user.trials.push(req.body)
        user.save().catch((err) => {
            console.log('Error saving user');
        })
    }).catch(err => {
        res.redirect('login');
    })
});


module.exports = router;