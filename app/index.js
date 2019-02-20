const express = require('express');
const Slack = require('./Slack');

const app = express();
const secret = process.env.SECRET || 'needs a secret';

const slack = new Slack({
    token: process.env.TOKEN,
    channels: process.env.CHANNELS || '',
    resend: process.env.RESEND !== 'false',
    ultra_restricted: process.env.ULTRA_RESTRICTED !== 'false',
    restricted: process.env.RESTRICTED !== 'false',
    expiration_delay_s: parseInt(process.env.EXPIRATION_DELAY_S || 24*60*60),
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log('Server running on http://localhost:' + PORT));

app.get('/invite', (req, res) => {
    if(secret != req.query.secret) {
        console.warn('Warning: secret is not correct', req.query.secret);
        res.json({
            ok: false,
            error: 'wrong secret',
        });
        return;
    }
    slack.invite({
        email: req.query.email,
        first_name: req.query.first_name,
        last_name: req.query.last_name,
    })
    .then(result => {
        console.log('Success', result);
        res.json({
            ok: result.ok,
            error: result.error,
        });
    })
    .catch(e => {
        console.error('Error', e);
        res.json({
            ok: false,
            error: e.message,
        });
    })
})