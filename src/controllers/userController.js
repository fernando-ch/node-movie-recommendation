module.exports = function (db) {
    return {
        async findUserByName(req, res) {
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
        }
    }
}