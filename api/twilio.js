const express = require('express');
const twilioRouter = express.Router();

twilioRouter.post('/', (req, res, next) => {
    const producto = req.body.producto,
        talle = req.body.talle,
        precio = req.body.precio,
        clientName = req.body.clientName,
        clientPhone = req.body.clientPhone,
        clientEmail = req.body.clientEmail;

    if (!producto || !talle || !precio || !clientName || !clientPhone || !clientEmail) {
        return res.sendStatus(400);
    } else {
        const accountSid = 'ACa83a98b4e191868aa96bf2e8e82b6494';
        const authToken = 'bb7de8ab7043caf70c70c4529e9dd227';
        const client = require('twilio')(accountSid, authToken);

        client.messages
            .create({
                body: `Recibiste una consulta por ${producto} talle ${talle} ($${precio}) de ${clientName} tel: ${clientPhone}, email: ${clientEmail}`,
                from: 'whatsapp:+14155238886',
                to: 'whatsapp:+5492213605742'
            })
            .then(message => console.log(message.sid))
            .done();
        res.sendStatus(201);
    }


})

module.exports = twilioRouter;