const http = require('http');
const jwt = require('jsonwebtoken');
const config = require('../config');

function makeRequest(path, method = 'GET', data = null, token = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 5000,
      path: path,
      method: method,
      headers: {
        'Content-Type': 'application/json',
      }
    };

    if (token) {
      options.headers['Authorization'] = `Bearer ${token}`;
    }

    const req = http.request(options, (res) => {
      let responseData = '';
      
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      
      res.on('end', () => {
        try {
          const jsonData = JSON.parse(responseData);
          resolve({ status: res.statusCode, data: jsonData });
        } catch (error) {
          resolve({ status: res.statusCode, data: responseData });
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    if (data) {
      req.write(JSON.stringify(data));
    }

    req.end();
  });
}

async function testFullFlow() {
  try {
    console.log('Testing full authentication and dashboard flow...\n');

    // Step 1: Try to login with a known user
    console.log('1. Attempting login...');
    const loginData = {
      email: 'parthilpanchani94@gmail.com',
      password: 'password123' // This might not be the correct password
    };
    
    const loginResponse = await makeRequest('/api/auth/login', 'POST', loginData);
    console.log(`   Login Status: ${loginResponse.status}`);
    
    if (loginResponse.status === 200 && loginResponse.data.token) {
      const token = loginResponse.data.token;
      console.log(`   Login successful! Token: ${token.substring(0, 20)}...`);
      
      // Step 2: Test dashboard endpoint with valid token
      console.log('\n2. Testing dashboard endpoint with valid token...');
      const dashboardResponse = await makeRequest('/api/student/dashboard', 'GET', null, token);
      console.log(`   Dashboard Status: ${dashboardResponse.status}`);
      
      if (dashboardResponse.status === 200) {
        console.log('   Dashboard data received successfully!');
        console.log(`   Stats:`, dashboardResponse.data.stats);
        console.log(`   Upcoming Events: ${dashboardResponse.data.upcomingEvents?.length || 0}`);
        console.log(`   Recent Activities: ${dashboardResponse.data.recentActivities?.length || 0}`);
        console.log(`   Certificates: ${dashboardResponse.data.certificates?.length || 0}`);
        
        if (dashboardResponse.data.upcomingEvents && dashboardResponse.data.upcomingEvents.length > 0) {
          console.log('\n   Sample upcoming event:');
          const event = dashboardResponse.data.upcomingEvents[0];
          console.log(`     Title: ${event.title}`);
          console.log(`     Date: ${event.date}`);
          console.log(`     Status: ${event.status}`);
        }
      } else {
        console.log(`   Dashboard failed: ${JSON.stringify(dashboardResponse.data)}`);
      }
    } else {
      console.log(`   Login failed: ${JSON.stringify(loginResponse.data)}`);
      
      // Try with a different user
      console.log('\n   Trying with different user...');
      const loginData2 = {
        email: 'student1@gmail.com',
        password: 'password123'
      };
      
      const loginResponse2 = await makeRequest('/api/auth/login', 'POST', loginData2);
      console.log(`   Login Status: ${loginResponse2.status}`);
      
      if (loginResponse2.status === 200 && loginResponse2.data.token) {
        const token2 = loginResponse2.data.token;
        console.log(`   Login successful! Token: ${token2.substring(0, 20)}...`);
        
        // Test dashboard with second user
        const dashboardResponse2 = await makeRequest('/api/student/dashboard', 'GET', null, token2);
        console.log(`   Dashboard Status: ${dashboardResponse2.status}`);
        console.log(`   Dashboard Response: ${JSON.stringify(dashboardResponse2.data)}`);
      }
    }

  } catch (error) {
    console.error('Error testing full flow:', error.message);
  }
}

// Run the test
testFullFlow();
