const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new mongoose.Schema({
    username: {type: String, unique: true},
    email: {type: String, unique: true},
    password: String,
    trials: [new Schema({
        opponent: String,
        guesses: [String],
        targetWord: String,
        win: Boolean
    })],
    normalTrials: [new Schema({
        guesses: [String],
        targetWord: String,
        win: Boolean
    })],
    normalWon: {type: Number, default: 0},
    normalAvg: {type: Number, default: 0},
    normalWinRate: {type:Number, default: 0},
    godTrials: [new Schema({
        guesses: [String],
        targetWord: String,
        win: Boolean
    })],
    godWon: {type:Number, default: 0},
    godAvg: {type:Number, default: 0},
    godWinRate: {type: Number, default: 0},
    friends: [String],
    friendRequests: [String], 
    notifications: [new Schema({
        type: String, 
        message: String, 
        time: Date 
    })],
    challenges: [new Schema({
        challenger: String,
        targetWords: [String]
    })],
    activeMatches: [new Schema({
        opponent: String,
        mySuppliedWords: [String],
        opponentSuppliedWords: [String],
        myTrials: [new Schema({
            guesses: [String],
            targetWord: String,
            win: Boolean
        })],
        opponentTrials: [new Schema({
            guesses: [String],
            targetWord: String,
            win: Boolean
        })]
    })],
    pastMatches: [new Schema({
        opponent: String,
        mySuppliedWords: [String],
        opponentSuppliedWords: [String],
        myTrials: [new Schema({
            guesses: [String],
            targetWord: String,
            win: Boolean
        })],
        opponentTrials: [new Schema({
            guesses: [String],
            targetWord: String,
            win: Boolean
        })],
        result: String,
        myTotalGuesses: Number,
        opponentTotalGuesses: Number
    })],
    pendingChallenges: [new Schema({
        challengee: String,
        targetWords: [String]
    })]



});

const User = mongoose.model('User', userSchema);

module.exports = User;