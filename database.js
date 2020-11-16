const { MongoClient } = require("mongodb")
const uri = 'mongodb://localhost:27017'

let db

console.log('Starting database connection')

MongoClient.connect(uri, {useUnifiedTopology: true})
    .then(mongoClient => {
        console.log('Successfully connected to the database')
        db = mongoClient.db('movieRecommendation')
    })
    .catch(error => {
        console.error('Error while training to connect to the database', error)
        process.exit(1)
    })

module.exports = {
    findUserById(id) {
        return db.collection('users').findOne({ _id: id })
    },

    findUserByName(name) {
        return db.collection('users').findOne({ name: name })
    },

    findCurrentRound() {
        return db.collection('rounds').findOne({ current: true })
    },

    async findAllStreams() {
        let streams = await db.collection('streams', { _id: 0 }).find().toArray()
        return streams.map(streams => streams.name)
    },

    findStreamByName(stream) {
        return db.collection('streams').findOne({ name: stream }, { _id: 1 })
    },

    async titleExists(title) {
        let result = db.collection('rounds').findOne({ 'movies.title': `/^${title}$/i` }, { _id: 1 })
        return Boolean(result)
    },

    async makeRecommendation(userId, title, stream) {
        let round = await this.findCurrentRound()
        let userMovie = round.movies.find(movie => movie.userId === userId)

        if (userMovie) {
            await db.collection('rounds').updateOne(
                { _id: round._id, 'movies.userId': userId },
                {
                    $set: {
                        'movies.$': { title, stream, userId }
                    }
                }
            )
        }

        await db.collection('rounds').updateOne(
            { _id: round._id },
            {
                $addToSet: {
                    movies: { title, stream, userId }
                }
            }
        )
    }
}