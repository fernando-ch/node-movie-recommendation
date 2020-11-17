const express = require('express')
const cors = require('cors')
const db = require('./database')

const app = express()
const port = 3000

app.use(express.json())
app.use(cors())

app.get('/users/:userName', async (req, res) => {
    try {
        let user = await db.findUserByName(req.params.userName)

        if (!user) {
            let message = `User with name ${req.params.userName} cannot be found`
            console.log(message)
            res.status(404).json({message})
            return
        }

        res.json({id: user._id})
    } catch (error) {
        console.error('Error when looking for user.', error)
        res.status(500).json()
    }
})

app.get('/rounds/current', async (req, res) => {
    try {
        let round = await db.findCurrentRound()
        
        if (!round) {
            let message = `Current round cannot be found`
            console.log(message)
            res.status(404).json({message})
            return
        }
        
        res.json(round)
    }
    catch (error) {
        console.error('Error when looking for round.', error)
        res.status(500).json()
    }
})

app.get('/streams', async (req, res) => {
    try {
        let streams = await db.findAllStreams()
        res.json(streams)
    } catch (e) {
        console.error('Error while trying to fetch streams.', e)
        res.status(500).json()
    }
})

app.post('/recommendations', async (req, res) => {
    try {
        let { userId, title, stream } = req.body

        title = title?.trim()

        if (!await db.findUserById(userId)) {
            res.status(401).json()
        }

        if (!await db.findStreamByName(stream)) {
            res.status(400).json({ message: 'O stream informado não é uma opção válida' })
            return
        }

        if (await db.titleExists(userId, title)) {
            res.status(400).json({ message: 'Esse filme já foi recomendado' })
            return
        }

        await db.makeRecommendation(userId, title, stream)

        res.json({ message: 'Recomendação realizada com sucesso' })
    } catch (e) {
        console.error('Error while trying to save a recommendation.', e)
        res.status(500).json()
    }
})

app.listen(port, () => console.log(`App running and listening at port ${port}`))
