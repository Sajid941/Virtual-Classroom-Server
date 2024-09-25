const express = require('express')
const cors = require('cors');
const { default: mongoose } = require('mongoose');
const port = 3000 || process.env.PORT
const app = express()
require('dotenv').config()
const { developers } = require("./models/developer")
const userRoute = require("./Routes/userRoutes")

mongoose
    .connect(`mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@virtualclassrommcluster.aq29t.mongodb.net/ClassNet?retryWrites=true&w=majority&appName=VirtualClassrommCluster`)
    .then(() => {
        console.log("MongoDb Connected");
    })
    .catch(err => {
        console.error(err)
    })
//middleware
app.use(cors())
app.use(express.json())
app.use('/users', userRoute);
async function run() {
    try {
        app.get("/developers", async (req, res) => {
            const result = await developers.find({});
            res.send(result);
        })
    }
    finally {

    }
}
run().catch(console.dir)
app.get('/', (req, res) => {
    res.send('Hello World!')
})

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
