const express = require('express')
const axios = require('axios')
const { response } = require('express')
const cors = require('cors')

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

const PORT = process.env.port || 3001

app.listen(PORT)