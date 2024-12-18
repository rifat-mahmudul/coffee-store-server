const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config();
const port = process.env.PORT || 5000;
const app = express();

app.use(cors());
app.use(express.json());

const user = process.env.DB_USER;
const pass = process.env.DB_PASS;

const uri = `mongodb+srv://${user}:${pass}@cluster0.zee3o.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function run() {
    try {

        await client.connect();
        console.log("Connected to MongoDB");

        
        const coffeeCollection = client.db('coffeeDB').collection('coffees');

        //save coffee in the DB
        app.post('/coffees', async (req, res) => {
            const coffee = req.body;
            const result = await coffeeCollection.insertOne(coffee);
            res.send(result)
        })

        //get all coffee data form DB
        app.get('/coffees', async(req, res) => {
            const coffees = await coffeeCollection.find().toArray();
            res.send(coffees);
        })

        //get one coffee data from DB
        app.get('/coffees/:id', async (req, res) => {
            const id = req.params.id;
            const query = {_id : new ObjectId(id)};
            const result = await coffeeCollection.findOne(query);
            res.send(result);
        })

        //update a coffee data in DB
        app.put('/coffees/:id', async(req, res) => {
            const id = req.params.id;
            const query = {_id : new ObjectId(id)};
            const options = { upsert: true };
            const updateCoffee = req.body;
            const coffee = {
                $set: {
                    name : updateCoffee.name,
                    chef : updateCoffee.chef,
                    supplier : updateCoffee.supplier,
                    taste : updateCoffee.taste,
                    category : updateCoffee.category,
                    price : updateCoffee.price,
                    photoURL : updateCoffee.photoURL
                },
            };

            const result = await coffeeCollection.updateOne(query, coffee, options);
            res.send(result);
        })

        //Delete a coffee from DB
        app.delete('/coffees/:id', async(req, res) => {
            const id = req.params.id;
            const query = {_id : new ObjectId(id)};
            const result = await coffeeCollection.deleteOne(query);
            res.send(result);
        })

        // Send a ping to confirm a successful connection
        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);


app.get("/", (req, res) => {
    res.send('SERVER IS RUNNING......');
});

app.listen(port, () => {
    console.log(`THE SERVER IS RUNNING FROM ${port}`);
})