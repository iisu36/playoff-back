require('dotenv').config()
const express = require('express')
const axios = require('axios')
const mongoose = require('mongoose')
const cors = require('cors')

const Player = require('./player')

const app = express()

app.use(express.static('build'))
app.use(express.json())
app.use(cors())

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('connected to MongoDB')
  })
  .catch((error) => {
    console.log('error connection to MongoDB', error.message)
  })

app.get('/playoff', async (req, res, next) => {
  const standings = {}
  try {
    const result = await axios.get(
      'https://api-web.nhle.com/v1/playoff-bracket/2025'
    )

    /* result.data.standings.forEach((team) => {
      standings[team.teamAbbrev.default] = {
        teamName: team.teamName.default,
        teamId: team.teamAbbrev.default,
        points: team.points,
        division: team.divisionName,
        divisionRank: team.divisionSequence,
        leagueRank: team.leagueSequence,
        teamLogo: team.teamLogo,
      }
    }) */
    res.json(result.data)
  } catch (err) {
    console.log('Failed to fetch standings from nhl api')
    next(err)
  }
})

app.put('/anari/players', (req, res, next) => {
  const body = req.body

  Player.findOne({ name: body.name })
    .then((existingPlayer) => {
      if (existingPlayer) {
        existingPlayer.secondRound = body.secondRound
        existingPlayer.conference = body.conference
        existingPlayer.stanleyCup = body.stanleyCup
        return Player.findByIdAndUpdate(existingPlayer._id, existingPlayer, {
          new: true,
        })
      }
    })
    .then((savedPlayer) => {
      res.status(200).json(savedPlayer.toJSON())
    })
    .catch((error) => next(error))
})

app.post('/anari/players', (req, res, next) => {
  const body = req.body

  const player = new Player({
    name: body.name,
    firstRound: body.firstRound,
    secondRound: body.secondRound,
    conference: body.conference,
    stanleyCup: body.stanleyCup,
    connsmythe: body.connsmythe,
    points: body.points,
  })

  player
    .save()
    .then((savedPlayer) => {
      res.status(201).json(savedPlayer.toJSON())
    })
    .catch((error) => next(error))
})

app.get('/anari/players', async (req, res) => {
  Player.find({}).then((players) => {
    res.json(players)
  })
})

const PORT = process.env.PORT || 3001

app.listen(PORT)
