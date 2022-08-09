const express = require('express');

const app = express();

app.get('/about', function(req, res){
    res.send('Its Working');
})

app.listen(3000, ()=>{
    console.log('Server has started')
})