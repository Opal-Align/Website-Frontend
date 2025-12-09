// ============================================
// AZURE TABLE STORAGE FALLBACK SERVICE
// ============================================
// This service calls a secure Azure Function API endpoint
// instead of accessing Azure Table Storage directly from the browser.
// 
// IMPORTANT: Never put AZURE_CONNECTION_STRING in VITE_ environment variables!
// Connection strings must stay server-side only.
// ============================================

/**
 * Check if Azure fallback API is available
 * Azure Functions API is always available in Azure Static Web Apps .
 */
export const isAzureConfigured = () => {
  return true; // API is part of the deployment
};

/**
 * Save form submission to Azure Table Storage via secure API
 * @param {Object} formData - Form data object with name, email, company, website, phone, message
 * @param {string} formType - Type of form (e.g., "contact", "sms-opt-in")
 * @param {string} errorReason - Reason why HubSpot failed (optional)
 * @returns {Promise<Object>} Success response from API
 */
export const saveToAzureTable = async (formData, formType = "contact", errorReason = null) => {
  try {
    // Prepare the payload for the API
    const payload = {
      ...formData,
      formType,
      errorContext: errorReason || undefined,
      timestamp: new Date().toISOString(),
      source: 'web',
      // Add browser context
      pageUri: typeof window !== 'undefined' ? window.location.href : undefined,
      pageName: typeof document !== 'undefined' ? document.title : undefined,
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : undefined,
    };

    // Call the secure Azure Function API endpoint
    const response = await fetch('/api/submitForm', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    // Parse response
    let responseData;
    try {
      responseData = await response.json();
    } catch (parseError) {
      throw new Error(`Failed to parse API response: ${response.status} ${response.statusText}`);
    }

    // Check if request was successful
    if (!response.ok) {
      throw new Error(
        responseData.error || 
        responseData.details || 
        `API request failed: ${response.status} ${response.statusText}`
      );
    }

    if (!responseData.success) {
      throw new Error(responseData.error || 'API returned unsuccessful response');
    }

    console.log('Successfully saved to Azure Table Storage via API');

    return {
      success: true,
      message: responseData.message || 'Form submission saved to Azure Table Storage',
      rowKey: responseData.id || undefined,
      partitionKey: formType,
    };

  } catch (error) {
    console.error('Error saving to Azure Table Storage:', error);
    
    // Provide user-friendly error messages
    let errorMessage = 'Failed to save form submission';
    
    if (error.message) {
      errorMessage = error.message;
    } else if (error instanceof TypeError && error.message.includes('fetch')) {
      errorMessage = 'Network error: Unable to reach the API. Please check your connection.';
    }
    
    throw new Error(`Azure Table Storage error: ${errorMessage}`);
  }
};