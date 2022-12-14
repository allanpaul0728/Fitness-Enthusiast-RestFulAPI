const express = require('express');
const cors = require('cors');

require('dotenv').config();
const jsonwt = require('jsonwebtoken');

const { ObjectId } = require('mongodb');
const MongoUtil = require('./MongoUtil');


const MONGO_URL = process.env.MONGO_URL;
const DB_ID = process.env.DB_ID;
const TOKEN_ACCESS = process.env.TOKEN_ACCESS;

const app = express();

app.use(express.json());
app.use(cors());

function accessToken(id, email) {
    return jsonwt.sign({
        'id': id,
        'email': email
    }, TOKEN_ACCESS, {
        'expiresIn': '24h'
    })
}

function checkIfAuthenticatedJsonWT(req, res, next) {

    if (req.headers.authorization) {
        const headers = req.headers.authorization;
        const token = headers.split(" ")[1];

        jsonwt.verify(token, TOKEN_ACCESS, function (err, tokenKey) {

            if (err) {
                res.status(403);
                res.json({
                    'error': 'Invalid Access Token'
                })
                return;
            }
            req.accounts = tokenKey;
            next();
        })
    } else {
        res.status(403);
        res.json({
            'error':'Input token key to access this route'
        })
    }
}

async function main() {
    const db = await MongoUtil.connect(MONGO_URL, DB_ID);

    app.get('/', function(req, res){
        res.send('Yes, its working');
    })

    app.get('/workouts', async function(req,res) {

        try {
            let criteria = {};
            if (req.query.muscle) {
                criteria.muscle = {
                    '$regex': req.query.muscle,
                    '$options': 'i'
                }
            }
            if (req.query.target_muscle) {
                criteria.target_muscle = {
                    '$and': req.query.target_muscle
                }
            }

            const workout = await db.collection('workouts').find(criteria, {
                'projection': {
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
                'error': 'Internal server error'
            })
        }
    })

    app.get('/workouts/:workoutId', async function (req, res) {
        try {
            let criteria = {};
            if (req.query.exercise_name) {
                criteria.exercise_name = {
                    '$regex': req.query.exercise_name,
                    '$options': 'i'
                }
            }

            if (req.query.difficulty) {
                criteria.difficulty = {
                    '$elemMatch': req.query.difficulty
                }
            }

            if (req.query.workout_rate) {
                criteria.workout_rate = {
                    '$gt': parseInt(req.query.workout_rate)
                }
            }

            if (req.query.difficulty) {
                outline.difficulty = {
                    '$or': req.query.difficulty
                }
            }

            const workout = await db.collection('workouts').find(criteria, {
                'projection': {
                    '_id': 1,
                    'exercise_name': 1,
                    'decription': 1,
                    'difficulty': 1,
                    'duration': 1,
                    'repetitions': 1,
                    'sets': 1,
                    'equipment': 1,
                    'rest_time': 1,
                    'procedure': 1,
                    'photo_url': 1,
                    'workout_rate': 1
                }
            }).toArray();
            res.json(workout);
        } catch (e) {
            console.log(e);
            res.status(500);
            res.json({
                'error': 'Internal server error'
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
                'message':'Workout document has been successfully created',
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
                'message': "Workout sub-document successfully added",
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

    app.put('/workouts/:workoutId', async function(req,res) {
        try {
            const workout = await db.collection('workouts').findOne({
                '_id': ObjectId(req.params.workoutId)
            })
            const outcome = await db.collection('workouts').updateOne({
                '_id': ObjectId(req.params.workoutId)
            }, {
                "$set": {
                    'muscle': req.body.muscle ? req.body.muscle : workout.muscle,
                    'muscle_term': req.body.muscle_term ? req.body.muscle_term : workout.muscle_term,
                    'target_muscle': req.body.target_muscle ? req.body.target_muscle : workout.target_muscle,
                    'target_muscleTerm': req.body.target_muscleTerm ? req.body.target_muscleTerm : workout.target_muscleTerm
                }
            })

            res.json({
                'message': 'Workout document has been successfully updated',
                'outcome': outcome
            })
        } catch (e) {
            onsole.log(e);
            res.status(500);
            res.json({
                'error': e
            })
        }
    })

    app.put('/workouts/:workoutId', async function (req,res) {
        try {
            const workout = await db.collection('workouts').findOne({
                'workout._id':ObjectId(req.params.workoutId)
            })
            const outcome = await db.collection('workouts').updateOne({
                'workout._id': ObjectId(req.params.workoutId)
            }, {
                '$set': {
                    'workout.$.exercise_name': req.body.exercise_name ? req.body.exercise_name : workout.exercise_name,
                    'workout.$.description': req.body.description ? req.body.description : workout.description,
                    'workout.$.difficulty': req.body.difficulty ? req.body.difficulty : workout.difficulty,
                    'workout.$.duration': req.body.duration ? req.body.duration : workout.duration,
                    'workout.$.repetitions': req.body.repetitions ? req.body.repetitions : workout.repetitions,
                    'workout.$.sets': req.body.sets ? req.body.sets : workout.sets,
                    'workout.$.equipment': req.body.equipment ? req.body.equipment : workout.equipment,
                    'workout.$.rest_time': req.body.rest_time ? req.body.rest_time : workout.rest_time,
                    'workout.$.procedure': req.body.procedure ? req.body.procedure : workout.procedure,
                    'workout.$.photo_url': req.body.photo_url ? req.body.photo_url : workout.photo_url,
                    'workout.$.workout_rate': req.body.workout_rate ? req.body.workout_rate : workout.workout_name
                }
            })
        
            res.json({
                'message': 'Workout sub-document has been successfully updated',
                'outcome': outcome
            })
        } catch (e) {
            console.log(e);
            res.status(500);
            res.json({
                'error': 'Internal server error'
            })
        }
    })

    app.delete('/workouts/:workoutId', async function(req,res) {
        await db.collection('workouts').deleteOne({
            '_id':ObjectId(req.params.workoutId)
        })
        res.json({
            'message':'Workout document has been successfully deleted'
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
            'message': 'Workout sub-document has been successfully deleted',
            'outcome': outcome
        })
    })


    // Route for Users
    app.post('/accounts', async function (req,res) {
        try {
            const outcome = await db.collection('accounts').insertOne({
                "email": req.body.email,
                "password": req.body.password
            });

            res.json({
                'message': 'successfully created an account',
                'outcome': outcome
            })
        } catch (e) {
            console.log(e);
            res.status(500);
            res.json({
                'error': e
            })
        }
    })

    // Route for Signing in
    app.post('/signin', async function(req,res) {
        
        const account = await db.collection('accounts').findOne({
            "email": req.body.email,
            "password": req.body.password
        });

        if(account) {
            let token = accessToken(account._id, account.email);
            res.json({
                'accessToken': token
            })
        } else {
            res.status(401);
            res.json({
                'message': 'Invalid account email or password'
            })
        }
    })

    // Route for Account's Profile
    app.get('/accounts/:accountId', [checkIfAuthenticatedJsonWT], async function(req,res) {
        res.json({
            "id": req.accounts.id,
            "email": req.accounts.email,
            'message': 'account profile has been viewed'
        })
    })

}
main();



app.listen(3000, ()=>{
    console.log('Server has started')
})