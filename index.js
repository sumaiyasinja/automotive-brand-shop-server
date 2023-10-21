const express = require('express')
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config()
const app = express()
const port = process.env.PORT || 5000

// middleware
app.use(cors())
app.use(express.json())


app.get('/', (req, res) => {
  res.send('Welcome to your automotive shop server!')
})


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.ctrkbrk.mongodb.net/?retryWrites=true&w=majority`;

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

    const database = client.db("BrandCarShopDB");
    const CarsCollection = database.collection("CarsCollection");
    const brandCollection = database.collection("brandCollection");
    const cart = database.collection("cart");

    // Read all products
    app.get('/products', async(req,res)=>{  
      const result = await CarsCollection.find().toArray();
      res.send(result);
    })
    // post product
    app.post('/products', async(req,res)=>{
        const newCar= req.body
        console.log(newCar)
        const result = await CarsCollection.insertOne(newCar);
        res.send(result)
      })

      // get single product
    app.get('/products/:id', async (req, res) => {
          const id = req.params.id
          const filter = { _id: new ObjectId(id) }
          const result = await CarsCollection.findOne(filter); 
          res.send(result);
        })
        
    // update by id
    app.put('/products/:id', async (req, res) => {
      const id = req.params.id;
      const car = req.body;
      console.log("id", id, car);
      const filter = { _id: new ObjectId(id) };
      const options = { upsert: true };
      const updatedCar ={
        $set: {
         name : car.name,
         price : car.price,
         rating : car.rating,
         brands : car.brands,
         types : car.types,
         description : car.description,
         photo : car.photo,

      },
    };
      const result = await CarsCollection.updateOne(
        filter,
        updatedCar,
        options
      );
      res.send(result);
    });


    // Brand collection
    app.get('/brands', async (req, res) => {
      const result = await brandCollection.find().toArray();
      res.send(result);
    })
    app.get('/brands/:brands', async (req, res) => {
      const brands = req.params.brands;
      const filter = { brands: {$eq :(brands)} };
      const result = await brandCollection.findOne(filter);
      res.send(result);
    })
    //Cart
        // Read all products of cart
        app.get('/cart', async(req,res)=>{
          const result = await cart.find().toArray();
          res.send(result);
          })

        // post product
        app.post('/cart', async(req,res)=>{
            const newProd= req.body
            console.log(newProd)
            const result = await cart.insertOne(newProd);
            res.send(result)
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


app.listen(port, () => {
  console.log(`Automotive Brand shop app listening on port ${port}`)
})