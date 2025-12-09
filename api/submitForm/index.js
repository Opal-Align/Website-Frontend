const { TableClient } = require("@azure/data-tables");

module.exports = async function (context, req) {
  context.log('Form submission received');

  // CORS headers
  context.res = {
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    }
  };

  // Handle preflight
  if (req.method === 'OPTIONS') {
    context.res.status = 200;
    return;
  }

  if (req.method !== 'POST') {
    context.res.status = 405;
    context.res.body = { error: 'Method not allowed' };
    return;
  }

  try {
    const formData = req.body;
    
    if (!formData) {
      context.res.status = 400;
      context.res.body = { error: 'No form data provided' };
      return;
    }

    // Get Azure connection string from environment
    const connectionString = process.env.AZURE_STORAGE_CONNECTION_STRING;
    const tableName = process.env.AZURE_TABLE_NAME || 'FormSubmissions';

    if (!connectionString) {
      context.log.error('Azure Storage not configured');
      context.res.status = 500;
      context.res.body = { error: 'Storage not configured' };
      return;
    }

    // Connect to Azure Table Storage
    const tableClient = TableClient.fromConnectionString(
      connectionString,
      tableName
    );

    // Ensure table exists
    await tableClient.createTable().catch(() => {
      // Table already exists, ignore error
    });

    // Create entity
    const entity = {
      partitionKey: formData.formType || 'contact',
      rowKey: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
      name: formData.name || '',
      email: formData.email || '',
      company: formData.company || '',
      website: formData.website || '',
      phone: formData.phone || '',
      message: formData.message || '',
      source: formData.source || 'web',
      errorContext: formData.errorContext || '',
    };

    // Save to Azure
    await tableClient.createEntity(entity);

    context.log('Successfully saved to Azure Table Storage');
    
    context.res.status = 200;
    context.res.body = {
      success: true,
      message: 'Form submitted successfully',
      id: entity.rowKey
    };

  } catch (error) {
    context.log.error('Error saving to Azure:', error);
    context.res.status = 500;
    context.res.body = {
      success: false,
      error: 'Failed to save form data',
      details: error.message
    };
  }
};