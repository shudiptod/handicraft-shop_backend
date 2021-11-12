const express = require('express');
const { MongoClient } = require('mongodb');
const cors = require('cors');
const ObjectId = require('mongodb').ObjectId;

require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;

//middleware
app.use(cors());
app.use(express.json());


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.upabr.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });


async function run() {

    try {
        await client.connect();
        console.log('hitting db');
        const database = client.db('nakshi');
        const productsCollection = database.collection('products');
        const usersCollection = database.collection('users');
        const ordersCollection = database.collection('orders');
        const reviewsCollection = database.collection('reviews');
        console.log(productsCollection);

        // user functions ===============================

        // get api all products
        app.get('/products', async (req, res) => {
            const cursor = productsCollection.find({});
            const products = await cursor.toArray();
            console.log('hiiting all products');
            res.send(products);
        });

        // get single products 
        app.get('/products/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const product = await productsCollection.findOne(query);
            res.send(product);
        });

        //post api ---add user
        app.post('/adduser', async (req, res) => {
            const user = req.body;
            const result = await usersCollection.insertOne(user);
            res.json(result);
        });

        // get single user 
        app.get('/users/:email', async (req, res) => {
            const mail = req.params.email;
            console.log(req.params)
            const query = { email: mail };
            const user = await usersCollection.findOne(query);
            res.send(user);
        });

        // post api  - add an order 
        app.post('/order', async (req, res) => {

            const order = req.body;
            const result = await ordersCollection.insertOne(order);
            console.log(result);
            res.json(result);
        });

        // get my orders api 
        app.get('/orders/:email', async (req, res) => {

            const mail = req.params.email;

            const cursor = ordersCollection.find({ userMail: mail });
            const orders = await cursor.toArray();
            console.log("order: " + orders);
            console.log('hiiting my orders');
            res.send(orders);

        });

        // add a review 
        app.post('/review', async (req, res) => {

            const review = req.body;
            const result = await reviewsCollection.insertOne(review);
            console.log(result);
            res.json(result);
        });
        // get api ----->all reviews
        app.get('/reviews', async (req, res) => {
            const cursor = reviewsCollection.find({});
            const reviews = await cursor.toArray();
            console.log('hiiting all reviews');
            res.send(reviews);
        });


        // delete api 
        app.delete('/bookings', async (req, res) => {

            const id = req.query.id;
            const query = { _id: ObjectId(id) };
            console.log("id: " + id);
            console.log("query: " + query);
            const result = await ordersCollection.deleteOne(query);
            res.json(result);
        });

        // admin functions =====================================

        // get all user orders 
        app.get('/allorders', async (req, res) => {

            const cursor = ordersCollection.find({});
            const orders = await cursor.toArray();
            res.send(orders);

        });
        // get all users 
        app.get('/users', async (req, res) => {

            const cursor = usersCollection.find({});
            const users = await cursor.toArray(cursor);
            res.send(users);
        });

        //update pending status
        app.put('/updatePending', async (req, res) => {

            const id = req.query.id;
            console.log(req.query);
            console.log("id:" + id)
            const filter = { _id: ObjectId(id) };
            console.log("filter: " + filter)
            const updateDoc = {
                $set: {
                    pending: false
                }
            };
            const result = await ordersCollection.updateOne(filter, updateDoc);
            console.log(result);
            res.json(result);
        })

    }
    finally {
        //await client.close();
    }
}
run().catch(console.dir);


app.get('/', (req, res) => {
    res.send('Baiccha lon 200 deikkha lon 200..');
});

app.listen(port, () => {
    console.log("Running server on port " + port);
});