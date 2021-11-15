const express = require("express");
const app = express();
const cors = require("cors");
const { MongoClient } = require("mongodb");
const ObjectId = require("mongodb").ObjectId;
require("dotenv").config();

const port = process.env.PORT || 7000;

app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.vhv3e.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
console.log(uri);
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function run() {
  try {
    await client.connect();
    console.log("database connected");

    const database = client.db("Lip-Queens");
    const lipisticsCollection = database.collection("Lipistics");
    const ordersCollection = database.collection("orders");
    const usersCollection = database.collection("users");
    const reviewsCollection = database.collection("reviews");

    app.get("/Lipistics", async (req, res) => {
      const cursor = lipisticsCollection.find({});
      const Lipistics = await cursor.toArray();
      res.send(Lipistics);
    });

    app.get("/Lipistics/:id", async (req, res) => {
      const id = req.params.id;
      const qurey = { _id: ObjectId(id) };
      const lipstick = await lipisticsCollection.findOne(qurey);
      res.json(lipstick);
    });

    app.post("/orders", async (req, res) => {
      const order = req.body;
      const result = await ordersCollection.insertOne(order);
      res.json(result);
    });

    app.get("/orders", async (req, res) => {
      const cursor = ordersCollection.find({});
      const order = await cursor.toArray();

      res.send(order);
    });

    app.delete("/orders/:id", async (req, res) => {
      const id = req.params.id;
      const qurey = { _id: ObjectId(id) };
      const result = await ordersCollection.deleteOne(qurey);
      res.json(result);
    });

    app.put("/orders/:id", async (req, res) => {
      const id = req.params.id;
      const updateStatus = req.body;
      const filter = { _id: ObjectId(id) };
      const option = { upsert: true };
      const updateDoc = { $set: { status: updateStatus.status } };
      const result = await ordersCollection.updateOne(
        filter,
        updateDoc,
        option
      );
      res.json(result);
    });

    app.delete("/Lipistics/:id", async (req, res) => {
      const id = req.params.id;
      const qurey = { _id: new ObjectId(id) };
      const result = await lipisticsCollection.deleteOne(qurey);
      res.json(result);
    });

    app.post("/Lipistics", async (req, res) => {
      const lipstick = req.body;
      const result = await lipisticsCollection.insertOne(lipstick);
      res.json(result);
    });

    app.post("/users", async (req, res) => {
      const user = req.body;
      console.log(user);
      const result = await usersCollection.insertOne(user);

      res.json(result);
    });

    app.put("/users", async (req, res) => {
      const user = req.body;
      const filter = { email: user.email };

      const updateDoc = { $set: { role: "admin" } };
      const result = await usersCollection.updateOne(filter, updateDoc);
      res.json(result);
    });

    app.get("/users/:email", async (req, res) => {
      const email = req.params.email;
      const query = { email: email };
      const user = await usersCollection.findOne(query);
      let isAdmin = false;
      if (user?.role === "admin") {
        isAdmin = true;
      }
      res.json({ admin: isAdmin });
    });

    app.post("/reviews", async (req, res) => {
      const user = req.body;
      console.log(user);
      const result = await reviewsCollection.insertOne(user);

      res.json(result);
    });

    app.get("/reviews", async (req, res) => {
      const cursor = reviewsCollection.find({});
      const review = await cursor.toArray();

      res.send(review);
    });
  } finally {
    //  await client.close()
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Lip Queens");
});

app.listen(port, () => {
  console.log("Listening form port : ", port);
});
