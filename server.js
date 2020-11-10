const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');

const catalogoRouter = require('./api/catalogo');
const twilioRouter = require('./api/twilio');

const app = express();

if (process.env.NODE_ENV === 'production') {
    //Set static folder
    app.use(express.static('frontend/build'));

    app.get('*', (req, res) => {
        res.sendFile(path.resolve(__dirname, 'frontend', 'build', 'index.html'));
    })
}

const PORT = process.env.PORT || 5000;

app.use(bodyParser.json());

app.use(cors({
    'Access-Control-Allow-Origin': 'http://127.0.0.1:5500',
    'Access-Control-Allow-Origin': 'http://localhost:3000'
}));

app.use('/catalogo', catalogoRouter);
app.use('/twilio', twilioRouter);

app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
})

module.exports = app;