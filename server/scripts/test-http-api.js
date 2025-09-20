const fetch = require('node-fetch');

async function testHTTPAPI() {
  try {
    console.log('Testing HTTP API...');
    
    // First, let's test the public events endpoint
    const eventsResponse = await fetch('http://localhost:5000/api/events');
    const eventsData = await eventsResponse.json();
    
    console.log('Public events endpoint response:');
    console.log(`Status: ${eventsResponse.status}`);
    console.log(`Events found: ${eventsData.events?.length || 0}`);
    
    if (eventsData.events && eventsData.events.length > 0) {
      console.log('Sample event:');
      console.log(`  Title: ${eventsData.events[0].title}`);
      console.log(`  Date: ${eventsData.events[0].date}`);
      console.log(`  Status: ${eventsData.events[0].status}`);
    }
    
  } catch (error) {
    console.error('Error testing HTTP API:', error.message);
    console.log('Make sure the server is running on http://localhost:5000');
  }
}

// Run the test
testHTTPAPI();
