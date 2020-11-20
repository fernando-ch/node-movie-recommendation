const { MongoClient } = require("mongodb")
const ObjectID = require('mongodb').ObjectID
const uri = 'mongodb://localhost:27017'

let db

module.exports = {
    async connect() {
        try {
            console.log('Starting database connection')
            let mongoClient = await MongoClient.connect(uri, {useUnifiedTopology: true})
            console.log('Successfully connected to the database')
            db = mongoClient.db('movieRecommendation')
        } catch(error) {
            console.error('Error while training to connect to the database', error)
            throw error
        }
    },

    findUserById(id) {
        return db.collection('users').findOne({ _id: new ObjectID(id) })
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

    async titleExists(userId, title) {
        let result = await db.collection('rounds').findOne(
            {
                movies: {
                    $elemMatch: {
                        userId: {$ne: new ObjectID(userId)},
                        title: new RegExp(`^${title}$`, 'i')
                    }
                }
            },
            { _id: 1 }
        )

        return Boolean(result)
    },

    async makeRecommendation(userId, title, stream) {
        userId = new ObjectID(userId)
        let round = await this.findCurrentRound()
        let userMovie = round.movies?.find(movie => movie.userId.toString() === userId.toString())

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