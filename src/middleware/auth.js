const jwt = require('jsonwebtoken')
const User = require('../models/user')

const auth = async (req, res, next) => {
    try {
        const token = req.header('Authorization').replace('Bearer ', '') // Header title set in Postman. token stores the value
        // /\ .replace() removes 'Bearer ' from the string, giving the JSON Web Token. Will throw error if token not provided.
        const decoded = jwt.verify(token, process.env.JWT_SECRET) // Use something better than secretstring in the real world. Create string in a separate file that is in .gitignore
        const user = await User.findOne({ _id: decoded._id, 'tokens.token': token })
        // 'tokens.token' looks for a given token in the tokens object

        if (!user) { throw new Error() }

        req.token = token // This targets the specific token that was used for login. Relevant because it will allow users to sign out of one device instead of all devices.
        req.user = user
        next()
    } catch (error) {
        res.status(401).send({ error: 'Please authenticate' })
    }
}

module.exports = auth