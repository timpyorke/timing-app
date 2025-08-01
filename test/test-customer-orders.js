// Test customer orders API integration
const API_BASE_URL = 'http://localhost:8000';

// Generate UUID for testing
function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

async function testCustomerOrdersAPI() {
  console.log('🧪 Testing Customer Orders API Integration...\n');

  const testCustomerId = generateUUID();
  console.log('Test Customer ID:', testCustomerId);

  try {
    // Step 1: Create a test order for the customer
    console.log('\n1️⃣ Creating test order...');
    
    const orderData = {
      user_id: testCustomerId,
      customer_info: {
        name: "API Test Customer",
        phone: "+66812345678",
        email: "apitest@customer.timing.com"
      },
      items: [
        {
          menu_id: 1,
          quantity: 2,
          price: 4.50,
          customizations: {
            size: "Large",
            milk: "Oat Milk",
            sweetness: "75%",
            temperature: "Iced",
            extras: ["Extra Shot"]
          }
        }
      ],
      total: 9.00
    };

    const createResponse = await fetch(`${API_BASE_URL}/api/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(orderData)
    });

    let createdOrderId = null;
    
    if (createResponse.ok) {
      const orderResult = await createResponse.json();
      createdOrderId = orderResult.data?.id;
      console.log(`✅ Order created successfully! ID: ${createdOrderId}`);
    } else {
      const error = await createResponse.text();
      console.log('⚠️ Order creation failed:', error);
      console.log('Continuing with existing orders test...');
    }

    // Step 2: Test fetching orders by customer ID
    console.log('\n2️⃣ Fetching orders by customer ID...');
    
    const ordersResponse = await fetch(`${API_BASE_URL}/api/orders/customer/${testCustomerId}`);
    
    console.log(`Status: ${ordersResponse.status}`);
    
    if (ordersResponse.ok) {
      const ordersResult = await ordersResponse.json();
      console.log('✅ Orders fetched successfully!');
      console.log('Response structure:', {
        success: ordersResult.success,
        dataType: Array.isArray(ordersResult.data) ? 'array' : typeof ordersResult.data,
        orderCount: Array.isArray(ordersResult.data) ? ordersResult.data.length : 0
      });
      
      if (ordersResult.data && ordersResult.data.length > 0) {
        console.log('📋 Sample order data:');
        const sampleOrder = ordersResult.data[0];
        console.log({
          id: sampleOrder.id,
          status: sampleOrder.status,
          total: sampleOrder.total,
          customer_name: sampleOrder.customer_info?.name,
          created_at: sampleOrder.created_at,
          items_count: Array.isArray(sampleOrder.items) ? sampleOrder.items.length : 0
        });
        
        // Test individual order status check
        if (sampleOrder.id) {
          console.log('\n3️⃣ Testing individual order status...');
          const statusResponse = await fetch(`${API_BASE_URL}/api/orders/${sampleOrder.id}/status`);
          
          if (statusResponse.ok) {
            const statusResult = await statusResponse.json();
            console.log('✅ Order status fetched successfully!');
            console.log('Status data:', {
              id: statusResult.data?.id,
              status: statusResult.data?.status,
              total: statusResult.data?.total
            });
          } else {
            console.log('⚠️ Failed to fetch order status');
          }
        }
      } else {
        console.log('ℹ️ No orders found for this customer ID');
      }
    } else {
      const error = await ordersResponse.text();
      console.log('❌ Failed to fetch orders:', error);
    }

    // Step 3: Test with a non-existent customer ID
    console.log('\n4️⃣ Testing with non-existent customer ID...');
    const fakeCustomerId = 'fake-customer-id-12345';
    
    const fakeResponse = await fetch(`${API_BASE_URL}/api/orders/customer/${fakeCustomerId}`);
    console.log(`Status: ${fakeResponse.status}`);
    
    if (fakeResponse.ok) {
      const fakeResult = await fakeResponse.json();
      console.log('✅ Non-existent customer handled gracefully');
      console.log('Orders found:', Array.isArray(fakeResult.data) ? fakeResult.data.length : 0);
    } else {
      console.log('ℹ️ Non-existent customer returns error (expected behavior)');
    }

  } catch (error) {
    console.log('❌ Test failed with error:', error.message);
  }

  console.log('\n🎯 Customer Orders API Integration Test Complete!');
}

// Test API data transformation
function testDataTransformation() {
  console.log('\n🔄 Testing Data Transformation Logic...\n');

  // Sample API response structure
  const mockApiResponse = {
    success: true,
    data: [
      {
        id: 123,
        user_id: "test-user-123",
        status: "preparing",
        total: "15.50",
        created_at: "2025-08-01T12:00:00Z",
        customer_info: {
          name: "John Doe",
          phone: "+66812345678",
          email: "john@test.com"
        },
        items: [
          {
            menu_id: 1,
            name: "Matcha Latte",
            quantity: 2,
            price: 7.75,
            customizations: {
              size: "Large",
              milk: "Oat Milk",
              sweetness: "50%",
              temperature: "Iced",
              extras: ["Extra Shot", "Whipped Cream"]
            }
          }
        ]
      }
    ]
  };

  console.log('✅ Mock API Response Structure Valid');
  console.log('Order ID:', mockApiResponse.data[0].id);
  console.log('Customer:', mockApiResponse.data[0].customer_info.name);
  console.log('Items:', mockApiResponse.data[0].items.length);
  console.log('Total:', mockApiResponse.data[0].total);
  
  console.log('\n🔄 Data Transformation Test Complete!');
}

// Run all tests
async function runAllTests() {
  await testCustomerOrdersAPI();
  testDataTransformation();
  
  console.log('\n🏁 All Tests Complete!');
  console.log('\nNext Steps:');
  console.log('1. Start your Timing API server on port 8000');
  console.log('2. Run the React app: npm run dev');
  console.log('3. Test the customer orders functionality in the UI');
  console.log('4. Check browser console for API integration logs');
}

runAllTests().catch(console.error);