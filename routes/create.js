const express = require('express');
const router = express.Router();
const myLib = require('../library/myLib.js');
const User = require('../models/User.js');

router.get('/', (req, res) =>{
    res.render('create', {
        fields: {
            email: '',
            username: '',
            password: '',
            confirm: ''
        }
    });
})

// create a user
router.post('/', (req, res) =>{
    // Validate inputs

    // Valid email
    // passwords match
    if (req.body.password !== req.body.confirm){
        return res.render('create', {
            err: true,
            msg: 'Passwords do not match',
            fields: req.body
        });
    }
    
    let username = req.body.username;
    let email = req.body.email;
    let hash = myLib.passwordHash(req.body.password);


    const user = new User({username: username, email: email, password: hash})
    user.save().then(() => { // on success, just log the user in
        req.session.username = username;
        return res.redirect('game');
    }).catch(err => { // on fail 
        if (err.code === 11000){ // Then we have a duplicate value
            let dup = Object.keys(err.keyPattern)[0]; // The first value that is duplicate
            dup = myLib.capitalizeFirstLetter(dup);
            return res.render('create', {
                err: true,
                msg: dup + ' taken',
                fields: req.body
            });
        }
        else{
            return res.render('create',{
                err: true,
                msg: 'There is an unknown error, hmu at 2407784277 and we can talk ab it over drinks',
                fields: req.body
                
            });
        }
    });
})



module.exports = router;