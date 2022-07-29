const express = require('express');
const router = express.Router();
const User = require('../models/User.js');
const lib = require('../library/lib.js');

router.get('/', (req, res) =>{
    res.render('login', {
        fields: {
            username: '',
            password: ''
        }
    });
})
// get request to this urls sign the person out and then send them to /login
router.get('/signout', (req,res) => {
    req.session.username = undefined;
    res.redirect('/');
})

router.post('/', (req, res) => {
    let username = req.body.username;
    let password = lib.passwordHash(req.body.password);
    
    User.findOne({username: username}).then((user) =>{
        if (user.password === password){ // if you entered the correct username and password
            req.session.username = username;
            return res.redirect('home');
        }
        else{ // if password is incorrect
            return res.render('login', {
                msg: 'Incorrect Password',
                fields: req.body
            });
        }   
    }).catch(err => {
        console.log(err);
        return res.render('login', {
            msg: 'Account not found',
            fields: req.body
        })
    });  
 })


module.exports = router;