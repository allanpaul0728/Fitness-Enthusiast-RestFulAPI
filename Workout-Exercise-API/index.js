const express = require('express');

const app = express();

app.get('/', function(req, res){
    res.send('Yes, its working');
})


app.listen(3000, ()=>{
    console.log('Server has started')
})