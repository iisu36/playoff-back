const mongoose = require('mongoose')

const url = process.env.MONGODB_URI


mongoose.connect(url, { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false, useCreateIndex: true })
    .then(() => {
        console.log('connected to MongoDB')
    })
    .catch((error) => {
        console.log('error connecting to MongoDB:', error.message)
    })

const teamSchema = new mongoose.Schema({
    name: String,
    teamId: Number,
    division: String,
    points: Number
})

const pelaajaSchema = new mongoose.Schema({
    standing: Number,
    name: String,
    teams: [teamSchema],
    points: Number,
    pisteporssi: Number
})

pelaajaSchema.set('toJSON', {
    transform: (document, returnedObject) => {
        returnedObject.id = returnedObject._id.toString()
        delete returnedObject._id
        delete returnedObject.__v
    }
})

module.exports = mongoose.model('Pelaaja', pelaajaSchema)