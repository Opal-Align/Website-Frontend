// ============================================
// AZURE TABLE STORAGE CONFIGURATION
// ============================================
// Azure Table Storage connection string and table name
// These should be set in your .env file:
// VITE_AZURE_CONNECTION_STRING=DefaultEndpointsProtocol=https;AccountName=...;AccountKey=...;EndpointSuffix=core.windows.net
// VITE_AZURE_TABLE_NAME=your-table-name
// ============================================

// Try both with and without VITE_ prefix for compatibility
const AZURE_CONNECTION_STRING = import.meta.env.VITE_AZURE_CONNECTION_STRING || import.meta.env.AZURE_CONNECTION_STRING || "";
const AZURE_TABLE_NAME = import.meta.env.VITE_AZURE_TABLE_NAME || import.meta.env.AZURE_TABLE_NAME || "";


/**
 * Parse Azure connection string
 * @returns {Object|null} Object with accountName and accountKey, or null if invalid
 */
const parseConnectionString = () => {
  if (!AZURE_CONNECTION_STRING) {
    return null;
  }

  const parts = AZURE_CONNECTION_STRING.split(";");
  let accountName = "";
  let accountKey = "";
  let endpointSuffix = "core.windows.net";

  parts.forEach((part) => {
    const [key, ...valueParts] = part.split("=");
    const value = valueParts.join("=");
    
    if (key === "AccountName") {
      accountName = value;
    } else if (key === "AccountKey") {
      accountKey = value;
    } else if (key === "EndpointSuffix") {
      endpointSuffix = value;
    }
  });

  if (!accountName || !accountKey) {
    return null;
  }

  return { accountName, accountKey, endpointSuffix };
};

/**
 * Base64 decode a string
 */
const base64Decode = (str) => {
  // Browser-compatible base64 decode
  const binaryString = atob(str);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
};

/**
 * Create HMAC-SHA256 signature for Azure Table Storage
 */
const createSignature = async (stringToSign, accountKey) => {
  const key = base64Decode(accountKey);
  const encoder = new TextEncoder();
  const data = encoder.encode(stringToSign);
  
  const cryptoKey = await crypto.subtle.importKey(
    "raw",
    key,
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  
  const signature = await crypto.subtle.sign("HMAC", cryptoKey, data);
  const signatureArray = Array.from(new Uint8Array(signature));
  return btoa(String.fromCharCode(...signatureArray));
};

/**
 * Generate Azure Table Storage authorization header
 */
const generateAuthHeader = async (accountName, accountKey, url, method, headers) => {
  const urlObj = new URL(url);
  const canonicalizedResource = `/${accountName}${urlObj.pathname}`;
  
  // Build string to sign
  const stringToSign = [
    method || "GET",
    headers["Content-MD5"] || "",
    headers["Content-Type"] || "",
    headers["Date"] || headers["x-ms-date"] || "",
    canonicalizedResource,
  ].join("\n");

  const signature = await createSignature(stringToSign, accountKey);
  return `SharedKey ${accountName}:${signature}`;
};

/**
 * Save form submission to Azure Table Storage using REST API
 * @param {Object} formData - Form data object
 * @param {string} formType - Type of form (e.g., "contact", "sms-opt-in")
 * @param {string} errorReason - Reason why HubSpot failed (optional)
 * @returns {Promise<Object>} Success response
 */
export const saveToAzureTable = async (formData, formType = "contact", errorReason = null) => {
  const connectionInfo = parseConnectionString();
  
  if (!connectionInfo) {
    throw new Error(
      "Azure Table Storage is not configured. Please set AZURE_CONNECTION_STRING and AZURE_TABLE_NAME environment variables."
    );
  }

  const { accountName, accountKey, endpointSuffix } = connectionInfo;
  // Azure Table Storage table names are case-sensitive and must be URL-encoded
  const encodedTableName = encodeURIComponent(AZURE_TABLE_NAME);
  const tableUrl = `https://${accountName}.table.${endpointSuffix}/${encodedTableName}`;

  try {
    // Generate a unique row key (using timestamp + random string)
    const timestamp = new Date().toISOString();
    const randomSuffix = Math.random().toString(36).substring(2, 9);
    const rowKey = `${Date.now()}-${randomSuffix}`;
    const partitionKey = formType;

    // Prepare entity data (Azure Table Storage requires specific format)
    // PartitionKey and RowKey are required and must be strings
    // Note: Timestamp is automatically managed by Azure, don't include it
    const entity = {
      PartitionKey: String(partitionKey),
      RowKey: String(rowKey),
    };

    // Add optional fields (Azure doesn't allow null or empty strings for custom properties)
    // Only add properties that have actual values
    if (formData.name && formData.name.trim()) {
      entity.Name = String(formData.name).substring(0, 1000);
    }
    if (formData.email && formData.email.trim()) {
      entity.Email = String(formData.email).substring(0, 1000);
    }
    if (formData.message && formData.message.trim()) {
      entity.Message = String(formData.message).substring(0, 1000);
    }
    if (formData.company && formData.company.trim()) {
      entity.Company = String(formData.company).substring(0, 1000);
    }
    if (formData.website && formData.website.trim()) {
      entity.Website = String(formData.website).substring(0, 1000);
    }
    if (formData.phone && formData.phone.trim()) {
      entity.Phone = String(formData.phone).substring(0, 1000);
    }
    
    // Add metadata (always include these)
    entity.FormType = String(formType);
    entity.SubmittedAt = timestamp;
    entity.HubspotFailed = errorReason ? "true" : "false"; // Store as string
    
    if (errorReason && errorReason.trim()) {
      entity.HubspotError = String(errorReason).substring(0, 1000);
    }
    
    if (typeof window !== "undefined" && window.location.href) {
      entity.PageUri = String(window.location.href).substring(0, 1000);
    }
    if (typeof document !== "undefined" && document.title) {
      entity.PageName = String(document.title).substring(0, 1000);
    }
    if (typeof navigator !== "undefined" && navigator.userAgent) {
      entity.UserAgent = String(navigator.userAgent).substring(0, 1000);
    }

    const dateHeader = new Date().toUTCString();
    const headers = {
      "Content-Type": "application/json",
      "x-ms-date": dateHeader,
      "x-ms-version": "2019-02-02",
      "Accept": "application/json;odata=nometadata",
    };

    // Generate authorization header
    const authHeader = await generateAuthHeader(
      accountName,
      accountKey,
      tableUrl,
      "POST",
      headers
    );

    headers["Authorization"] = authHeader;

    const response = await fetch(tableUrl, {
      method: "POST",
      headers: headers,
      body: JSON.stringify(entity),
    });

    if (!response.ok) {
      let errorText = "";
      try {
        errorText = await response.text();
      } catch {
        // Ignore error reading response
      }
      
      if (response.status === 409) {
        // Entity already exists, try with a different row key
        return saveToAzureTable(formData, formType, errorReason);
      }
      
      throw new Error(
        `Azure Table Storage error: ${response.status} ${response.statusText} - ${errorText}`
      );
    }

    return {
      success: true,
      message: "Form submission saved to Azure Table Storage",
      rowKey: rowKey,
      partitionKey: partitionKey,
    };
  } catch (error) {
    throw new Error(
      `Azure Table Storage error: ${error.message || "Failed to save form submission"}`
    );
  }
};

/**
 * Check if Azure Table Storage is configured
 * @returns {boolean} True if configured, false otherwise
 */
export const isAzureConfigured = () => {
  return !!AZURE_CONNECTION_STRING && !!parseConnectionString();
};
