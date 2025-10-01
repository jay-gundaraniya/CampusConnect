const fetch = require('node-fetch');

async function testCertificateAPI() {
  try {
    console.log('🔍 Testing certificate API...');
    
    // First, let's test if the server is running
    const healthResponse = await fetch('http://localhost:5000/api/health');
    const healthData = await healthResponse.json();
    console.log('✅ Server health:', healthData);
    
    // Now test the certificate endpoint without authentication (should fail with 401)
    console.log('🔍 Testing certificate endpoint without auth...');
    const certResponse = await fetch('http://localhost:5000/api/certificates/user/68bc0ae955a7012975c2dd40');
    console.log('📊 Certificate response status:', certResponse.status);
    
    if (!certResponse.ok) {
      const errorData = await certResponse.json();
      console.log('❌ Certificate API error:', errorData);
    } else {
      const certData = await certResponse.json();
      console.log('✅ Certificate API success:', certData);
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testCertificateAPI();
