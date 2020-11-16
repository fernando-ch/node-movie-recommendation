module.exports = function (db) {
    return {
        findUserByName(name) {
            return db.collection('users').findOne({ name: name })
        },

        async streamExists(stream) {
            let result = await db.collection('streams').findOne({ name: stream }, { _id: 0 })
            return Boolean(result)
        }
    }
}