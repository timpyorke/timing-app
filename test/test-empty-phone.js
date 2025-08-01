// Test with empty phone number
const API_BASE_URL = 'http://localhost:8000';

async function testEmptyPhone() {
  console.log('Testing order creation with empty phone number...\n');

  try {
    const orderData = {
      customer_info: {
        name: "Customer No Phone",
        email: "nophone@customer.timing.com"
        // No phone field included
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
    } else {
      const error = await response.text();
      console.log('Error response:', error);
    }
  } catch (error) {
    console.log('Error:', error.message);
  }
}

testEmptyPhone();