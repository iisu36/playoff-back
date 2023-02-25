const mongoose = require('mongoose')

const teamSchema = new mongoose.Schema({
  name: String,
  teamId: Number,
  division: String,
  points: Number,
})

const pelaajaSchema = new mongoose.Schema({
  standing: Number,
  name: String,
  teams: [teamSchema],
  points: Number,
  pisteporssi: Number,
})

module.exports = mongoose.model('Pelaaja', pelaajaSchema)
