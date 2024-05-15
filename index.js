const express = require('express')
const app = express()
const cors = require('cors')
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config()
const port = process.env.PORT || 5000

app.use(cors())
app.use(express.json())



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.dz6vfqm.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;
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
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("You successfully connected to MongoDB!");
    const userCollection = client.db("Job_Box").collection("user")
    const jobCollection = client.db("Job_Box").collection("jobs")


    app.post("/user", async (req, res) => {
      const userInfo = req.body
      //console.log(userInfo)
      const result = await userCollection.insertOne(userInfo)
      res.send(result)
    })

    app.get("/user/:email", async (req, res) => {
      const email = req.params.email
      //console.log(email)
      const result = await userCollection.findOne({ email: email })
      if (result?.email) {

        res.send({ status: true, data: result })
      }
      else {
        res.send({ status: false })
      }
    })

    app.post("/job-add", async (req, res) => {
      jobInfo = req.body
      const result = await jobCollection.insertOne(jobInfo)
      res.send({ status: true, postRes: result })
    })

    app.get("/jobs", async (req, res) => {
      const result = await jobCollection.find({}).toArray()
      res.send({ status: true, jobData: result })
    })

    app.get("/jobDetail/:id", async (req, res) => {
      const jobId = req.params.id
      //console.log(jobId)
      const result = await jobCollection.findOne({ _id: new ObjectId(jobId) })
      res.send({ status: true, jobInfo: result })
    })

    app.patch("/apply", async (req, res) => {
      const applicantId = req.body.applicantId
      const jobId = req.body.jobId
      //console.log(jobId)
      const applicantEmail = req.body.applicantEmail
      //const filter= {_id: new ObjectId(jobId)}
      const updateDoc = {
        $push: { applicant: { _id: new ObjectId(applicantId), email: applicantEmail } }
      }
      const result = await jobCollection.updateOne({ _id: new ObjectId(jobId) }, updateDoc)
      if (result.acknowledged) {
        return res.send({ status: true, data: result })
      }
      res.send({ status: email })
    })

    app.patch("/question", async (req, res) => {
      const applicantId = req.body.userId
      const jobId = req.body.jobId
      //console.log(jobId)
      const applicantEmail = req.body.userEmail
      const applicantQuestion = req.body.question
      //const filter= {_id: new ObjectId(jobId)}
      const updateDoc = {
        $push: { askQuestion: { _id: new ObjectId(applicantId), email: applicantEmail, question: applicantQuestion, replay: [] } }
      }
      const result = await jobCollection.updateOne({ _id: new ObjectId(jobId) }, updateDoc)
      if (result.acknowledged) {
        return res.send({ status: true, data: result })
      }
      res.send({ status: email })
    })

    app.patch("/replay", async (req, res) => {
      const askerId = req.body.askerId
      const jobId = req.body.jobId
      //console.log(jobId)
      const replayMsg = req.body.replayMsg
      console.log(replayMsg)
      const applicantQuestion = req.body.question
      const filter = {
        _id: new ObjectId(jobId),
        "askQuestion._id": new ObjectId(askerId),
        "askQuestion.question":applicantQuestion,
      }

      //console.log(filter)
      const updateDoc = {
        $push: {
          "askQuestion.$.replay": replayMsg,
        }
      };
      const result = await jobCollection.updateOne(filter, updateDoc)
      console.log(result)
      if (result.acknowledged) {
        return res.send({ status: true, data: result })
      }
      res.send({ status: email })
    })

    app.get("/appliedJob/:email", async (req, res) => {
      const email = req.params.email
      console.log(email)
      const pipeline = [
        {
          $match: {
            'applicant.email': email
          }
        }
      ];
      const result = await jobCollection.aggregate(pipeline).toArray()
      res.send({ status: true, appliedJob: result })
    })

  } finally {

  }
}
run().catch(console.dir);

app.get('/', (req, res) => {
  res.send({ message: "Redux-job-running" })
})



app.listen(port, () => console.log(`redux-job-box Running on ${port}`))