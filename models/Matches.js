const mongoose = require('mongoose');
const Schema = mongoose.Schema;


const matchesSchema = new mongoose.Schema({
    matches: [new Schema({ // playerOne is going to be the winner 
        playerOne: String,
        playerTwo: String,
        scoreOne: Number,
        scoreTwo: Number
    })]
})

const Matches = mongoose.model('Matches', matchesSchema);

module.exports = Matches;
