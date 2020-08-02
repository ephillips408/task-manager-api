const app = require('./app')
const port = process.env.PORT

app.listen(port, () => {
    console.log(`Server is up on ${port}`)
})

// All other code removed because it was moved to app.js
// In order to run the code in the same way as the previous state, require the app.js file that was created, then deleted duplicate lines.