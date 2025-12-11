const { TableClient } = require("@azure/data-tables");

module.exports = async function (context, req) {
  context.log("=== Form submission received ===");
  context.log("Method:", req.method);
  context.log("Body:", JSON.stringify(req.body, null, 2));

  // Initialize response with CORS headers
  context.res = {
    status: 200,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
    body: null,
  };

  // Handle OPTIONS preflight
  if (req.method === "OPTIONS") {
    context.res.status = 200;
    context.res.body = "";
    return;
  }

  // Only allow POST
  if (req.method !== "POST") {
    context.res.status = 405;
    context.res.body = JSON.stringify({ 
      success: false,
      error: "Method not allowed" 
    });
    return;
  }

  try {
    // Parse request body
    let formData = req.body;
    if (!formData && req.rawBody) {
      try {
        formData = JSON.parse(req.rawBody);
      } catch (parseErr) {
        context.log.error("Failed to parse rawBody:", parseErr);
      }
    }

    if (!formData) {
      context.res.status = 400;
      context.res.body = JSON.stringify({ 
        success: false,
        error: "No form data provided" 
      });
      return;
    }

    // Get environment variables
    const connectionString = process.env.AZURE_STORAGE_CONNECTION_STRING;
    const tableName = process.env.AZURE_TABLE_NAME || "FormSubmissions";

    context.log("Connection string exists:", !!connectionString);
    context.log("Connection string length:", connectionString?.length || 0);
    context.log("Table name:", tableName);

    if (!connectionString) {
      context.log.error("CRITICAL: AZURE_STORAGE_CONNECTION_STRING is not set");
      context.res.status = 500;
      context.res.body = JSON.stringify({ 
        success: false,
        error: "Storage not configured",
        message: "AZURE_STORAGE_CONNECTION_STRING environment variable is missing"
      });
      return;
    }

    // Create table client
    let tableClient;
    try {
      tableClient = TableClient.fromConnectionString(
        connectionString,
        tableName
      );
      context.log("TableClient created successfully");
    } catch (clientError) {
      context.log.error("Failed to create TableClient:", clientError);
      context.res.status = 500;
      context.res.body = JSON.stringify({ 
        success: false,
        error: "Failed to initialize storage client",
        details: clientError.message
      });
      return;
    }

    // Ensure table exists
    try {
      await tableClient.createTable();
      context.log("Table created or already exists");
    } catch (tableError) {
      // Ignore if table already exists (409)
      if (tableError.statusCode !== 409) {
        context.log.warn("Table creation warning:", tableError.message);
      }
    }

    // Prepare entity
    const entity = {
      partitionKey: typeof formData.formType === "string"
        ? formData.formType
        : "contact",
      rowKey: `${Date.now()}_${Math.random().toString(36).slice(2)}`,
      timestamp: new Date().toISOString(),
      name: String(formData.name || ""),
      email: String(formData.email || ""),
      company: String(formData.company || ""),
      website: String(formData.website || ""),
      phone: String(formData.phone || ""),
      message: String(formData.message || ""),
      source: String(formData.source || "web"),
      errorContext: String(formData.errorContext || ""),
    };

    context.log("Entity to save:", JSON.stringify(entity, null, 2));

    // Save to Azure Table Storage
    try {
      await tableClient.createEntity(entity);
      context.log("✅ Successfully saved to Azure Table Storage");
      
      context.res.status = 200;
      context.res.body = JSON.stringify({
        success: true,
        message: "Form submitted successfully",
        id: entity.rowKey,
      });
    } catch (saveError) {
      context.log.error("Failed to save entity:", {
        message: saveError.message,
        code: saveError.code,
        statusCode: saveError.statusCode,
        stack: saveError.stack
      });
      
      context.res.status = 500;
      context.res.body = JSON.stringify({
        success: false,
        error: "Failed to save form data",
        details: saveError.message,
        code: saveError.code
      });
    }

  } catch (error) {
    context.log.error("Unexpected error:", {
      message: error.message,
      stack: error.stack,
      name: error.name,
      code: error.code
    });

    context.res.status = 500;
    context.res.body = JSON.stringify({
      success: false,
      error: "An unexpected error occurred",
      details: error.message,
    });
  }
};