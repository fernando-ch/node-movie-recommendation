module.exports = function (db) {
    return {
        async getCurrentRound(req, res) {
            try {
                let round = await db.findCurrentRound()

                if (!round) {
                    let message = `Current round cannot be found`
                    console.log(message)
                    res.status(404).json({message})
                    return
                }

                res.json(round)
            } catch (error) {
                console.error('Error when looking for round.', error)
                res.status(500).json()
            }
        }
    }
}