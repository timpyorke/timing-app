// Test that order creation properly includes customer_id/user_id
const API_BASE_URL = 'http://localhost:8000';

// Generate UUID for testing
function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

async function testCustomerIdInOrderCreation() {
  console.log('🧪 Testing Customer ID in Order Creation...\n');

  const testCustomerId = generateUUID();
  console.log('Test Customer ID:', testCustomerId);

  try {
    // Step 1: Create an order with customer_id/user_id
    console.log('\n1️⃣ Creating order with customer_id...');
    
    const orderData = {
      user_id: testCustomerId,
      customer_id: testCustomerId, // Include both field names
      customer_info: {
        name: "Customer ID Test User",
        phone: "+66812345678",
        email: "customeridtest@timing.com"
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

    console.log('Sending order data:', JSON.stringify(orderData, null, 2));

    const createResponse = await fetch(`${API_BASE_URL}/api/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(orderData)
    });

    console.log(`Create Order Status: ${createResponse.status}`);
    
    if (createResponse.ok) {
      const orderResult = await createResponse.json();
      console.log('✅ Order created successfully!');
      console.log('Order Response:', {
        success: orderResult.success,
        order_id: orderResult.data?.id,
        user_id_in_response: orderResult.data?.user_id,
        customer_id_in_response: orderResult.data?.customer_id,
        customer_name: orderResult.data?.customer_info?.name
      });

      const createdOrderId = orderResult.data?.id;
      
      // Step 2: Test fetching orders by customer ID
      if (createdOrderId) {
        console.log('\n2️⃣ Testing order retrieval by customer ID...');
        
        const fetchResponse = await fetch(`${API_BASE_URL}/api/orders/customer/${testCustomerId}`);
        console.log(`Fetch Orders Status: ${fetchResponse.status}`);
        
        if (fetchResponse.ok) {
          const fetchResult = await fetchResponse.json();
          console.log('✅ Orders fetched successfully!');
          
          const foundOrders = fetchResult.data || [];
          console.log('Orders found:', foundOrders.length);
          
          // Check if our created order is in the results
          const ourOrder = foundOrders.find(order => order.id?.toString() === createdOrderId?.toString());
          
          if (ourOrder) {
            console.log('✅ Created order found in customer orders!');
            console.log('Order details:', {
              id: ourOrder.id,
              user_id: ourOrder.user_id,
              customer_id: ourOrder.customer_id,
              customer_name: ourOrder.customer_info?.name,
              status: ourOrder.status
            });
          } else {
            console.log('❌ Created order NOT found in customer orders!');
            console.log('Available order IDs:', foundOrders.map(o => o.id));
          }
        } else {
          const error = await fetchResponse.text();
          console.log('❌ Failed to fetch orders:', error);
        }
      }

      // Step 3: Test with a different customer ID to ensure isolation
      console.log('\n3️⃣ Testing customer isolation...');
      const differentCustomerId = generateUUID();
      console.log('Different Customer ID:', differentCustomerId);
      
      const isolationResponse = await fetch(`${API_BASE_URL}/api/orders/customer/${differentCustomerId}`);
      
      if (isolationResponse.ok) {
        const isolationResult = await isolationResponse.json();
        const isolationOrders = isolationResult.data || [];
        
        console.log('Orders for different customer:', isolationOrders.length);
        
        if (isolationOrders.length === 0) {
          console.log('✅ Customer isolation working correctly!');
        } else {
          console.log('⚠️ Found orders for different customer (might be expected if shared test data)');
        }
      }

    } else {
      const error = await createResponse.text();
      console.log('❌ Failed to create order:', error);
    }

  } catch (error) {
    console.log('❌ Test failed with error:', error.message);
  }

  console.log('\n🎯 Customer ID Test Complete!');
}

// Run the test
testCustomerIdInOrderCreation().catch(console.error);