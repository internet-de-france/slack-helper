const fetch = require('node-fetch');
const { URLSearchParams } = require('url');

module.exports = class Slack {
    static get API_URL() { return 'https://cto-bro.slack.com/api/users.admin.invite'; }
    constructor(options) {
        this.options = options;
    }
    invite({email, first_name, last_name, channels}) {
        try {
            const params = new URLSearchParams();
            const data = Object.assign({
                email,
                expiration_ts: Math.round(Date.now() / 1000) + this.options.expiration_delay_s,
                first_name,
                last_name,
                full_name: `${first_name} ${last_name}`,
                channels,
            }, this.options);
            for (var k in data) {
                params.append(k, data[k]);
            }
            // console.log('Sending', params);
            return fetch(Slack.API_URL, {
                method: "POST",
                cache: "no-cache",
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded",
                },
                body: params,
            })
            .then(response => response.json())
        }
        catch(e) {
            console.log('Catched error', e);
            return Promise.reject(e);
        }
    }
}
