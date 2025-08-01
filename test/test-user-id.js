// Test user ID functionality with the Timing API
const API_BASE_URL = 'http://localhost:8000';

// Simulate the user ID generation function
function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

async function testUserIdFunctionality() {
  console.log('Testing user ID functionality with Timing API...\n');

  // Generate a test user ID
  const testUserId = generateUUID();
  console.log('Generated test user ID:', testUserId);

  try {
    console.log('\nTesting order creation with user_id...');
    
    const orderData = {
      user_id: testUserId,
      customer_info: {
        name: "Test User",
        phone: "+66812345678",
        email: "testuser@customer.timing.com"
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

    console.log('Sending order with user_id:', testUserId);

    const response = await fetch(`${API_BASE_URL}/api/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(orderData)
    });

    console.log(`Status: ${response.status}`);
    
    if (response.ok) {
      const result = await response.json();
      console.log('Order created successfully:', result);
      
      // Verify user_id is included in response
      if (result.data && result.data.user_id) {
        console.log('✅ User ID correctly included in response:', result.data.user_id);
      } else {
        console.log('⚠️ User ID not found in response');
      }
      
      return result.data.id;
    } else {
      const error = await response.text();
      console.log('❌ Error response:', error);
      return null;
    }
  } catch (error) {
    console.log('❌ Error:', error.message);
    return null;
  }
}

// Test with multiple user IDs to simulate different sessions
async function testMultipleUsers() {
  console.log('\n=== Testing Multiple User Sessions ===\n');
  
  const userIds = [
    generateUUID(),
    generateUUID(),
    generateUUID()
  ];
  
  for (let i = 0; i < userIds.length; i++) {
    console.log(`\n--- User Session ${i + 1} ---`);
    console.log('User ID:', userIds[i]);
    
    const orderId = await testUserIdFunctionality();
    if (orderId) {
      console.log(`✅ Session ${i + 1} successful - Order ID: ${orderId}`);
    } else {
      console.log(`❌ Session ${i + 1} failed`);
    }
  }
}

// Run the tests
testUserIdFunctionality()
  .then(() => testMultipleUsers())
  .then(() => console.log('\n🎉 User ID functionality testing completed!'))
  .catch(console.error);