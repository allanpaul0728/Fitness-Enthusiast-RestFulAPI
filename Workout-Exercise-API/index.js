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

    app.get('/workout', async function(req,res) {

        try {
        let outline = {};
        if (req.query.muscle) {
            outline.muscle = {
                '$regex': req.query.muscle,
                '$options': 'i'
            }
        }

        if (req.query.workout_rate) {
            outline.rate = {
                '$lte': parseInt(req.query.workout_rate)
            }
        }
        const workout = await db.collection('workout').findOne(outline, {
            'estimated': {
                '_id': 1,
                'muscle': 1,
                'muscle_term': 1,
                'target_muscle': 1,
                'target_muscleTerm': 1
            }
        }).toArray();
        res.json(workout);
        } catch (e) {
            console.log(e);
            res.status (500);
            res.json({
                'error': e
            })
        }
    })

    app.post('/workouts', async function(req,res){

        try {
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
    } catch(e) {
        console.log(e);
        res.status (500);
        res.json({
            'error': e
        })
    }
    })

    app.post('/workouts/:workoutId', async function(req,res) {

        try {
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
                    'sets':req.body.sets,
                    'equipment':req.body.equipment,
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
    } catch (e) {
        console.log(e);
        res.status (500);
        res.json({
            'error': e
        })
    }
    })

    app.get('/workout/:workoutId', async function(req,res) {
        const workouts = await db.collection('workout').findOne({
            _id: ObjectId(req.params.workoutId)
        })
        res.json(workouts);
    })

    app.put('/workouts/:workoutId', async function(req,res) {
        const workout = await db.collection('workouts').findOne({
            '_id': ObjectId(req.params.workoutId)
        })
        const outcome = await db.collection('workouts').updateOne({
            
        }, {
            
        })
    })

    app.delete('/workouts/:workoutId', async function(req,res) {
        await db.collection('workouts').deleteOne({
            '_id':ObjectId(req.params.workoutId)
        })
        res.json({
            'message':'successfully deleted'
        })
    })

    app.delete('/workout/:workoutId', async function(req, res) {
        const outcome = await db.collection('workouts').updateOne({
            'workout._id':ObjectId(req.params.workoutId)
        }, {
            '$pull': {
                'workout': {
                    '_id':ObjectId(req.params.workoutId)
                }
            }
        })
        res.json ({
            'message': 'successfully workout deleted',
            'outcome': outcome
        })
    })

}
main();



app.listen(3000, ()=>{
    console.log('Server has started')
})