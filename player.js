const mongoose = require('mongoose')

const seriesSchema = new mongoose.Schema({
  seriesLetter: String,
  topWins: Number,
  bottomWins: Number,
})

const playerSchema = new mongoose.Schema({
  name: String,
  firstRound: [seriesSchema],
  secondRound: [seriesSchema],
  conference: [seriesSchema],
  stanleyCup: [seriesSchema],
  points: Number,
  connsmythe: String,
})

module.exports = mongoose.model('Playoffsplayer', playerSchema)
