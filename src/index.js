const express = require('express')
const cors = require('cors')
const WebSocket = require('ws')
const db = require('./database')
const EventEmitter = require('events');
const eventEmitter = new EventEmitter()

const roundController = require('./controllers/roundController')(db)
const userController = require('./controllers/userController')(db)
const streamController = require('./controllers/streamController')(db)
const recommendationController = require('./controllers/recommendationController')(db, eventEmitter)

const app = express()
const port = 3000
const wsServer = new WebSocket.Server({ noServer: true });

app.use(express.json())
app.use(cors())

wsServer.on('connection', async ws => {
    async function sendCurrentRound() {
        let currentRound = await db.findCurrentRound()
        ws.send(JSON.stringify(currentRound))
    }

    await sendCurrentRound()
    eventEmitter.on('roundChanged', sendCurrentRound)
})

app.get('/users/:userName', userController.findUserByName)
app.get('/rounds/current', roundController.getCurrentRound)
app.get('/streams', streamController.getAllStreams)
app.post('/recommendations', recommendationController.makeRecommendation)

db.connect().then(() => {
    const server = app.listen(port, () => console.log(`App running and listening at port ${port}`));

    server.on('upgrade', (request, socket, head) => {
        wsServer.handleUpgrade(request, socket, head, socket => {
            wsServer.emit('connection', socket, request);
        });
    });
})
