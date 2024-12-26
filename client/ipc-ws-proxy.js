const {WebSocket} = require('ws');

const LOG = false;
const ws = new WebSocket('ws://127.0.0.1:7000');

const ready = new Promise((done, fail) => {
    ws.on('open', done);
    ws.on('error', fail);
});

ready.then(
    () => log('ready'),
    (err) => console.error('ws error', err)
);

ws.on('message', (data) => {
    data = data.toString();

    log('ws message', data);

    process.send(JSON.parse(data), undefined, undefined, (err) => {
        if (!err) return;

        console.error('process.send', err);
    });
});

process.on('message', async function (data) {
    await ready;

    log('message', data);

    ws.send(JSON.stringify(data));
});

function log(...args) {
    if (!LOG) return;

    console.log(...args);
}
