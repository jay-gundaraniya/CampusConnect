const http = require('http');

function makeRequest(path, token = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 5000,
      path: path,
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    };

    if (token) {
      options.headers['Authorization'] = `Bearer ${token}`;
    }

    const req = http.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const jsonData = JSON.parse(data);
          resolve({ status: res.statusCode, data: jsonData });
        } catch (error) {
          resolve({ status: res.statusCode, data: data });
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.end();
  });
}

async function testEndpoints() {
  try {
    console.log('Testing API endpoints...\n');

    // Test public events endpoint
    console.log('1. Testing public events endpoint...');
    const eventsResponse = await makeRequest('/api/events');
    console.log(`   Status: ${eventsResponse.status}`);
    console.log(`   Events found: ${eventsResponse.data.events?.length || 0}`);
    
    if (eventsResponse.data.events && eventsResponse.data.events.length > 0) {
      console.log(`   Sample event: ${eventsResponse.data.events[0].title}`);
    }
    console.log('');

    // Test health endpoint
    console.log('2. Testing health endpoint...');
    const healthResponse = await makeRequest('/api/health');
    console.log(`   Status: ${healthResponse.status}`);
    console.log(`   Response: ${JSON.stringify(healthResponse.data)}`);
    console.log('');

    // Test student dashboard endpoint (without token - should fail)
    console.log('3. Testing student dashboard endpoint (no token)...');
    const dashboardResponse = await makeRequest('/api/student/dashboard');
    console.log(`   Status: ${dashboardResponse.status}`);
    console.log(`   Response: ${JSON.stringify(dashboardResponse.data)}`);
    console.log('');

  } catch (error) {
    console.error('Error testing endpoints:', error.message);
  }
}

// Run the test
testEndpoints();
