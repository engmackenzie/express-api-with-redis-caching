const express = require('express');
const app = express();

app.use('/fish', require('./routes/fish'));

app.listen(4000, () => { console.log('listening on port 4000')});