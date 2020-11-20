module.exports = function (db) {
    return {
        async getAllStreams(req, res) {
            try {
                let streams = await db.findAllStreams()
                res.json(streams)
            } catch (e) {
                console.error('Error while trying to fetch streams.', e)
                res.status(500).json()
            }
        }
    }
}