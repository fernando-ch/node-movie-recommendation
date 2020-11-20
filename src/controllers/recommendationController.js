module.exports = function (db, eventEmitter) {
    return {
        async makeRecommendation(req, res) {
            try {
                let {userId, title, stream} = req.body

                title = title?.trim()

                if (!await db.findUserById(userId)) {
                    res.status(401).json()
                    return
                }

                if (!await db.findStreamByName(stream)) {
                    res.status(400).json({message: 'O stream informado não é uma opção válida'})
                    return
                }

                if (await db.titleExists(userId, title)) {
                    res.status(400).json({message: 'Esse filme já foi recomendado'})
                    return
                }

                await db.makeRecommendation(userId, title, stream)
                res.json({message: 'Recomendação realizada com sucesso'})

                eventEmitter.emit('roundChanged')
            } catch (e) {
                console.error('Error while trying to save a recommendation.', e)
                res.status(500).json()
            }
        }
    }
}