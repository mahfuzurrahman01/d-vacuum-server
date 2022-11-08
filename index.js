const express = require('express')
const cors = require('cors')
const { MongoClient, ServerApiVersion } = require('mongodb');
const app = express()
const port = process.env.PORT || 5000;
require('dotenv').config()
//middleware 
app.use(cors())
app.use(express.json())

//mongodb 

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@clusterm01.jgnnfze.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run(){
    try{
      const serviceCollection = client.db('serviceData').collection('services')
      //get services from mongodb
      app.get('/services',async(req,res)=>{
        const limit = parseInt(req.query.limit);
        const query ={}
        const cursor = serviceCollection.find(query).limit(limit)
        const result = await cursor.toArray() ;
        res.send(result)
      })
    }
    finally{

    }
}

run().catch(err=> console.log(err))








//simple api call
app.get('/', (req, res) => {
    res.send('service review app server is running well..')
})

app.listen(port, () => {
    console.log(`server is running on port ${port}`)
})