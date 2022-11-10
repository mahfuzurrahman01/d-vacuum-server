const express = require('express')
const cors = require('cors')
const jwt = require('jsonwebtoken')
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express()
const port = process.env.PORT || 5000;
require('dotenv').config()
//middleware 
app.use(cors())
app.use(express.json())

//mongodb 

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@clusterm01.jgnnfze.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

function verifyJwt(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    res.status(401).send({ massage: 'unauthorized access' })
  }
  const token = authHeader.split(' ')[1]
  jwt.verify(token, process.env.ACCESS_TOKEN, function (err, decoded) {
    if (err) {
      return res.status(403).send({ massage: 'unauthorized access' })
    }
    req.decoded = decoded;
    next()
  })


}



async function run() {
  try {
    const serviceCollection = client.db('serviceData').collection('services')
    const reviewCollection = client.db('serviceData').collection('reviews')
    //jwt 
    app.post('/jwt', async (req, res) => {
      const user = req.body;
      const token = jwt.sign(user, process.env.ACCESS_TOKEN, { expiresIn: '5h' })
      res.send({ token })
    })

    //insert new service on mongo
    app.post('/add_service', async (req, res) => {
      const service = req.body;
      const result = await serviceCollection.insertOne(service)
      res.send(result)
    })
    //get services from mongodb
    app.get('/services', async (req, res) => {
      const limit = parseInt(req.query.limit);
      const query = {}
      const cursor = serviceCollection.find(query).limit(limit)
      const result = await cursor.toArray();
      res.send(result)
    })
    // get a single service information 
    app.get('/service/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) }
      const service = await serviceCollection.findOne(query)
      res.send(service)
    })
    //insert review as insert one method
    app.post('/reviews', async (req, res) => {
      const review = req.body;
      const result = await reviewCollection.insertOne(review)
      res.send(result)
    })
    //delete review from data base client wise 
    app.delete('/review/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) }
      const result = await reviewCollection.deleteOne(query)
      res.send(result)
    })
    //update review from data 
    app.patch('/update/:id', async (req, res) => {
      const id = req.params.id;
      console.log(id)
      const query = { _id: ObjectId(id) }
      const review = req.body.newReview
      const updateDoc = {
        $set: {
          comment: review
        }
      }
      const result = await reviewCollection.updateOne(query, updateDoc)
      res.send(result)
    })
    //get reviews from database
    app.get('/comments/:id', async (req, res) => {
      const id = req.params.id;
      const query = { reviewId: id }
      const cursor = reviewCollection.find(query).sort({ time: -1 })
      const result = await cursor.toArray()
      res.send(result)
    })
    //get specific data for a client
    app.get('/comment', verifyJwt, async (req, res) => {
      const user = req.query.email;
      const decoded = req.decoded;
      console.log(decoded)
      if (decoded.email !== user) {
        res.status(403).send({ massage: 'unauthorized access' })
      }
      const query = { userEmail: user }
      const cursor = reviewCollection.find(query);
      const result = await cursor.toArray();
      res.send(result)
    })
  }
  finally {

  }
}

run().catch(err => console.log(err))








//simple api call
app.get('/', (req, res) => {
  res.send('service review app server is running well..')
})

app.listen(port, () => {
  console.log(`server is running on port ${port}`)
})