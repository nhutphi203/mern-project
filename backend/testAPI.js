import http from 'http';

const options = {
    hostname: 'localhost',
    port: 4000,
    path: '/api/v1/lab/results?status=Completed',
    method: 'GET'
};

const req = http.request(options, (res) => {
    let data = '';
    res.on('data', (chunk) => { data += chunk; });
    res.on('end', () => {
        try {
            const json = JSON.parse(data);
            console.log('Response status:', res.statusCode);
            console.log('Data count:', json.results ? json.results.length : 0);
            if (json.results && json.results.length > 0) {
                console.log('First result sample:');
                console.log(JSON.stringify(json.results[0], null, 2));
            }
        } catch (e) {
            console.log('Response:', data);
        }
    });
});

req.on('error', (error) => { console.error('Error:', error.message); });
req.end();
