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

app.get('/anari', async (req, res, next) => {
  const standings = {}
  try {
    const result = await axios.get('https://api-web.nhle.com/v1/standings/now')

    result.data.standings.forEach((team) => {
      standings[team.teamAbbrev.default] = {
        teamName: team.teamName.default,
        teamId: team.teamAbbrev.default,
        points: team.points,
        division: team.divisionName,
        divisionRank: team.divisionSequence,
        leagueRank: team.leagueSequence,
      }
    })
    res.json(standings)
  } catch (err) {
    console.log('Failed to fetch standings from nhl api')
    next(err)
  }
})

app.post('/anari/players', (req, res, next) => {
  const body = req.body

  const player = new Player({
    name: body.name,
    teams: body.teams,
    points: body.points,
    statLeader: body.statLeader,
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

app.get('/anari/statLeader', async (req, res, next) => {
  try {
    const result = await axios.get(
      'https://api.nhle.com/stats/rest/fi/leaders/skaters/points?cayenneExp=season=20232024%20and%20gameType=2'
    )
    const player = {
      name: result.data.data[0]?.player.lastName,
      points: result.data.data[0]?.points,
    }
    res.json(player)
  } catch (err) {
    console.log('error reaching statleader')
    next(err)
  }
})

const PORT = process.env.PORT || 3001

app.listen(PORT)
