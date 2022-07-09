const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new mongoose.Schema({
    username: {type: String, unique: true},
    email: {type: String, unique: true},
    password: String,
    trials: [new Schema({
        guesses: [String],
        targetWord: String,
        win: Boolean
    })]
});

const User = mongoose.model('User', userSchema);

module.exports = User;