const express = require('express');
const cors = require('cors');

require('dotenv').config();

const { ObjectId } = require('mongodb');
const MongoUtil = require('./MongoUtil');


const MONGO_URL = process.env.MONGO_URL;
const DB_ID = process.env.DB_ID;

const app = express();

app.use(express.json());
app.use(cors());

async function main() {
    const db = await MongoUtil.connect(MONGO_URL, DB_ID);

    app.get('/', function(req, res){
        res.send('Yes, its working');
    })

    app.post('/workouts', async function(req,res){
        const outcome = await db.collection('workouts').insertOne({
            "muscle":req.body.muscle,
            "muscle_term":req.body.muscle_term,
            "target_muscle":req.body.target_muscle,
            "target_muscleTerm":req.body.target_muscleTerm
        })
        res.json({
            'message':'successfully created',
            'outcome': outcome
        })
    })

    app.post('/workouts/:workoutId', async function(req,res) {
        const outcome = await db.collection('workouts').updateOne({
            '_id':ObjectId(req.params.workoutId)
        }, {
            '$push': {
                'workout': {
                    '_id':ObjectId(),
                    'exercise_name':req.body.exercise_name,
                    'description':req.body.description,
                    'difficulty':req.body.difficulty,
                    'duration':req.body.duration,
                    'repetitions':req.body.repetitions,
                    'set':req.body.set,
                    'rest_time':req.body.rest_time,
                    'procedure':req.body.procedure,
                    'photo_url':req.body.photo_url,
                    'workout_rate':req.body.workout_rate
                }
            }
        })
        res.json({
            'message': "successfully added sub-document",
            'outcome': outcome
        })
    })

}
main();



app.listen(3000, ()=>{
    console.log('Server has started')
})