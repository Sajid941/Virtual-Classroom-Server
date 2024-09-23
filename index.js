const express = require('express')
const cors = require('cors');
const { default: mongoose } = require('mongoose');
const port = 3000 || process.env.PORT
const app = express()
require('dotenv').config()

mongoose
    .connect(`mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.xweyicz.mongodb.net/ClassNet?retryWrites=true&w=majority&appName=Cluster0`)
    .then(() => {
        console.log("MongoDb Connected");
    })
    .catch(err => {
        console.error(err)
    })
//middleware
app.use(cors())

app.get('/', (req, res) => {
    res.send('Hello World!')
})

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})