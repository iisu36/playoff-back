const mongoose = require('mongoose')

const teamSchema = new mongoose.Schema({
  name: String,
  teamId: String,
  division: String,
  points: Number,
})

const playerSchema = new mongoose.Schema({
  name: String,
  teams: [teamSchema],
  points: Number,
  statLeader: Number,
})

module.exports = mongoose.model('Player', playerSchema)
