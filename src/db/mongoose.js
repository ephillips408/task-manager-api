const mongoose = require('mongoose')

mongoose.connect(process.env.MONGODB_URL, {
    // Video uses useNewUrlParser. Received warning about deprication, so changedto useUnifiedTopology. Both still have true setting.
    useUnifiedTopology: true,
    useCreateIndex: true,
    useFindAndModify: false // This address deprication warnings so that they will not be logged to the console. True by default.
})