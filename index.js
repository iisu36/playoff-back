require('dotenv').config()
const express = require('express')
const axios = require('axios')
const mongoose = require('mongoose')
const { response } = require('express')
const cors = require('cors')

const Pelaaja = require('./pelaaja')

const app = express()

app.use(express.static('build'))
app.use(express.json())
app.use(cors())

/* app.use(function (req, res, next) {
  res.header('Access-Control-Allow-Origin', 'YOUR-DOMAIN.TLD') // update to match the domain you will make the request from
  res.header(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept'
  )
  next()
}) */

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('connected to MongoDB')
  })
  .catch((error) => {
    console.log('error connection to MongoDB', error.message)
  })

app.get('/anari', async (req, res) => {
  const divisions = [
    { division: 'Atlantic', teams: [] },
    { division: 'Central', teams: [] },
    { division: 'Metropolitan', teams: [] },
    { division: 'Pacific', teams: [] },
  ]
  let allTeams = []
  try {
    const result = await axios.get('https://api-web.nhle.com/v1/standings/now')

    allTeams = result.data.standings.map((team) => {
      const teamToAdd = {
        team: team.teamName.default,
        teamId: team.teamAbbrev.default,
        points: team.points,
        division: team.divisionName,
        divisionRank: team.divisionSequence,
        leagueRank: team.leagueSequence,
      }

      divisions
        .find((division) => division.division === teamToAdd.division)
        .teams.push(teamToAdd)

      return teamToAdd
    })
  } catch {
    console.log('wrong')
  }
  const stats = {
    league: allTeams,
    divisions: divisions,
  }

  stats.league.sort((a, b) => a.leagueRank - b.leagueRank)

  res.json(stats)
})

app.post('/anari/pelaajat', (req, res, next) => {
  const body = req.body

  const pelaaja = new Pelaaja({
    standing: body.standing,
    name: body.name,
    teams: body.teams,
    points: body.points,
    pisteporssi: body.pisteporssi,
  })

  pelaaja
    .save()
    .then((savedPelaaja) => {
      res.status(201).json(savedPelaaja.toJSON())
    })
    .catch((error) => next(error))
})

app.get('/anari/pelaajat', async (req, res) => {
  Pelaaja.find({})
    .then((pelaajat) => {
      res.json(pelaajat)
    })
    .catch((error) => next(error))
})

app.get('/anari/porssi', async (req, res) => {
  const result = await axios.get(
    'https://api.nhle.com/stats/rest/fi/leaders/skaters/points?cayenneExp=season=20232024%20and%20gameType=2'
  )
  const pelaaja = {
    name: result.data.data[0]?.player.lastName,
    points: result.data.data[0]?.points,
  }
  res.json(pelaaja)
})

const PORT = process.env.PORT || 3001

app.listen(PORT)
