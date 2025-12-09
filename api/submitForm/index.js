import { TableClient } from "@azure/data-tables";

export default async function (context, req) {
  context.log("Form submission received");

  context.res = {
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  };

  if (req.method === "OPTIONS") {
    context.res.status = 200;
    return;
  }

  if (req.method !== "POST") {
    context.res.status = 405;
    context.res.body = { error: "Method not allowed" };
    return;
  }

  try {
    let formData = req.body;

    if (!formData && req.rawBody) {
      formData = JSON.parse(req.rawBody);
    }

    if (!formData) {
      context.res.status = 400;
      context.res.body = { error: "No form data provided" };
      return;
    }

    const connectionString = process.env.AZURE_STORAGE_CONNECTION_STRING;
    const tableName = process.env.AZURE_TABLE_NAME || "FormSubmissions";

    if (!connectionString) {
      context.res.status = 500;
      context.res.body = { error: "Storage not configured" };
      return;
    }

    const tableClient = TableClient.fromConnectionString(
      connectionString,
      tableName
    );

    await tableClient.createTable().catch(() => {});

    const entity = {
        partitionKey:
        typeof formData.formType === "string"
          ? formData.formType
          : "contact",
      rowKey: `${Date.now()}_${Math.random().toString(36).slice(2)}`,
      timestamp: new Date().toISOString(),
      name: formData.name || "",
      email: formData.email || "",
      company: formData.company || "",
      website: formData.website || "",
      phone: formData.phone || "",
      message: formData.message || "",
      source: formData.source || "web",
      errorContext: formData.errorContext || "",
    };

    await tableClient.createEntity(entity);

    context.res.status = 200;
    context.res.body = {
      success: true,
      message: "Form submitted successfully",
      id: entity.rowKey,
    };
  } catch (error) {
    context.log.error("Azure error:", error);

    context.res.status = 500;
    context.res.body = {
      success: false,
      error: "Failed to save form data",
      details: error.message,
    };
  }
}