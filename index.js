require('dotenv').config()
const express = require('express')
const axios = require('axios')
const { response } = require('express')
const cors = require('cors')

const Pelaaja = require('./pelaaja')

const app = express()

app.use(express.static('build'))
app.use(express.json())
app.use(cors())

app.get('/anari', async (req, res) => {
    const result = await axios.get('https://statsapi.web.nhl.com/api/v1/standings')

    const allTeams = []

    const divisions = result.data.records.map(division => {

        const teams = division.teamRecords.map(team => {

            const teamToAdd = {
                team: team.team.name,
                teamId: team.team.id,
                points: team.points,
                divisionRank: team.divisionRank,
                leagueRank: team.leagueRank,
                lastUpdated: team.lastUpdated
            }

            allTeams.push(teamToAdd)

            return teamToAdd
        })


        return {
            division: division.division.name,
            teams: teams
        }
    })

    const stats = {
        league: allTeams,
        divisions: divisions
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
        pisteporssi: body.pisteporssi
    })

    pelaaja.save()
        .then(savedPelaaja => {
            res.status(201).json(savedPelaaja.toJSON())
        })
        .catch(error => next(error))
})

app.get('/anari/pelaajat', (req, res) => {
    Pelaaja.find({}).then(pelaajat => {
        res.json(pelaajat)
    })
})

const PORT = process.env.PORT || 3001

app.listen(PORT)