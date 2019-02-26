const express = require('express');
const Slack = require('./Slack');

const app = express();
const SECRET = process.env.SECRET || 'needs a secret';

const slack = new Slack({
    token: process.env.TOKEN,
    resend: process.env.RESEND !== 'false',
    ultra_restricted: process.env.ULTRA_RESTRICTED !== 'false',
    restricted: process.env.RESTRICTED !== 'false',
    expiration_delay_s: parseInt(process.env.EXPIRATION_DELAY_S || 24*60*60),
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log('Server running on port ' + PORT));


function checkSecret(secret, res, next) {
    if(SECRET != secret) {
        console.warn('Warning: secret is not correct', secret);
        res.json({
            ok: false,
            error: 'wrong secret',
        });
    }
    else {
        next();
    }
}

function invite(req, res, {email, first_name, last_name, channels}) {
    slack.invite({
        email: email,
        first_name: first_name,
        last_name: last_name,
        channels: channels,
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
    });
}
function anonymise(query) {
    return Object.assign({}, query, {secret: '*************'});
}


var bodyParser = require('body-parser')
app.use( bodyParser.json() );       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
  extended: true
})); 
app.use(express.json());       // to support JSON-encoded bodies
app.use(express.urlencoded()); // to support URL-encoded bodies

// sanity check
app.get('/up', (req, res) => {
    res.end();
});

// check secret
app.use((req, res, next) => checkSecret(req.query.secret, res, next));

// mailchimp webhook validation
app.get('/mailchimp', (req, res) => {
    try {
        console.log('GET /mailchimp', anonymise(req.query));
        res.send('ok');
    }
    catch(e) {
        res.end();
    }
});

// mailchimp webhook 
app.post('/mailchimp', (req, res) => {
    try {
        console.log('POST /mailchimp', req.body.data.merges, anonymise(req.query));
        invite(req, res, {
            email: req.body.data.email,
            first_name: req.body.data.merges.FNAME,
            last_name: req.body.data.merges.LNAME,
            channels: req.query.channels,
        });
    }
    catch(e) {
        res.end();
    }
});

// ifttt webhook
app.get('/invite', (req, res) => {
    try {
        console.log('/invite', anonymise(req.query));
        invite(req, res, req.query);
    }
    catch(e) {
        res.end();
    }
});
