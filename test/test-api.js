// Simple test script to verify API integration
const API_BASE_URL = 'http://localhost:8000';

async function testApiEndpoints() {
  console.log('Testing Timing API integration...\n');

  // Test 1: Health check (if available)
  try {
    console.log('1. Testing health endpoint...');
    const healthResponse = await fetch(`${API_BASE_URL}/health`);
    console.log(`   Status: ${healthResponse.status}`);
    if (healthResponse.ok) {
      const healthData = await healthResponse.json();
      console.log('   Response:', healthData);
    }
  } catch (error) {
    console.log('   Health endpoint not available or server not running');
  }

  // Test 2: Get Menu
  try {
    console.log('\n2. Testing GET /api/menu...');
    const menuResponse = await fetch(`${API_BASE_URL}/api/menu`);
    console.log(`   Status: ${menuResponse.status}`);
    if (menuResponse.ok) {
      const menuData = await menuResponse.json();
      console.log('   Menu items found:', Array.isArray(menuData) ? menuData.length : 'Not an array');
      if (Array.isArray(menuData) && menuData.length > 0) {
        console.log('   First item:', menuData[0]);
      }
    } else {
      console.log('   Error response:', await menuResponse.text());
    }
  } catch (error) {
    console.log('   Error:', error.message);
  }

  // Test 3: Create Order (with sample data)
  try {
    console.log('\n3. Testing POST /api/orders...');
    const orderData = {
      customer_info: {
        name: "Test Customer",
        phone: "+66812345678",
        email: "test@customer.timing.com"
      },
      items: [
        {
          menu_id: 1,
          quantity: 1,
          price: 4.50,
          customizations: {
            size: "Medium",
            milk: "Oat Milk",
            sweetness: "50%",
            temperature: "Iced",
            extras: []
          }
        }
      ],
      total: 4.50
    };

    const orderResponse = await fetch(`${API_BASE_URL}/api/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(orderData)
    });

    console.log(`   Status: ${orderResponse.status}`);
    if (orderResponse.ok) {
      const orderResult = await orderResponse.json();
      console.log('   Order created:', orderResult);
      
      // Test 4: Check order status
      const orderId = orderResult.data?.id || orderResult.id;
      if (orderId) {
        console.log('\n4. Testing GET /api/orders/{id}/status...');
        const statusResponse = await fetch(`${API_BASE_URL}/api/orders/${orderId}/status`);
        console.log(`   Status: ${statusResponse.status}`);
        if (statusResponse.ok) {
          const statusData = await statusResponse.json();
          console.log('   Order status:', statusData);
        }
      }
    } else {
      console.log('   Error response:', await orderResponse.text());
    }
  } catch (error) {
    console.log('   Error:', error.message);
  }

  console.log('\nAPI integration test completed!');
}

// Run the test
testApiEndpoints().catch(console.error);