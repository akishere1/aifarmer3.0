const handleSubmit = async (e) => {
  e.preventDefault();
  
  try {
    // Get token from localStorage or cookies
    const token = localStorage.getItem('token') || '';
    
    const response = await fetch('/api/fields/add', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`  // Add token to Authorization header
      },
      body: JSON.stringify(fieldData)
    });
    
    if (!response.ok) {
      throw new Error('Failed to add field');
    }
    
    // Handle successful response
    // ... existing code ...
  } catch (error) {
    console.error('Error adding field:', error);
    // ... existing code ...
  }
}; 