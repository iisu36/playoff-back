const express = require('express')
const axios = require('axios')
const { response } = require('express')

const app = express()

app.get('/', async (req, res) => {
    const data = await axios.get('https://statsapi.web.nhl.com/api/v1/standings')

    const allTeams = []

    const divisions = data.data.records.map(division => {

        const teams = division.teamRecords.map(team => {
            const joukkue = {
                team: team.team.name,
                points: team.points,
                divisionRank: team.divisionRank,
                leagueRank: team.leagueRank
            }

            allTeams.push(joukkue)

            return joukkue
        })
        

        return {
            division: division.division.name,
            teams: teams
        }
    })

    const stats = allTeams.concat(divisions)

    stats.sort((a, b) => a.leagueRank - b.leagueRank)

    res.send(stats)
})

app.listen(3000)