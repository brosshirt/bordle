const express = require('express');
const router = express.Router();
const User = require('../models/User.js');

router.get('/', (req, res) =>{
    req.session.username = undefined; // going back to the login page logs you out
    res.render('login', {
        fields: {
            username: '',
            password: ''
        }
    });
})

router.post('/', (req, res) => {
    let username = req.body.username;
    let password = req.body.password;

    User.findOne({username: username}).then((user) =>{
        if (user){ 
            if (user.password === password){ // if you entered the correct username and password
                req.session.username = username;
                return res.redirect('game');
            }
            else{ // if password is incorrect
                return res.render('login', {
                    err: true,
                    msg: 'Incorrect Password',
                    fields: req.body
                });
            }
        }
        else{ // if the user does not exist in the db
            return res.render('login', {
                err: true,
                msg: 'Account not found',
                fields: req.body
            });
        }
    })
})

module.exports = router;