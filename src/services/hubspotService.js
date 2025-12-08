import axios from "axios";
import { saveToAzureTable, isAzureConfigured } from "./azureService.js";

// ============================================
// HUBSPOT CONFIGURATION
// ============================================
// Replace these with your actual HubSpot details:
// 1. HubSpot Portal ID: Found in HubSpot Settings > Integrations > Private Apps
// 2. HubSpot Form GUID: Found in HubSpot > Marketing > Forms > Your Form > Settings
// 3. HubSpot API Key (optional): If using API key authentication
// ============================================

// HubSpot Portal ID (replace with your actual portal ID)
// Try both with and without VITE_ prefix for compatibility
const HUBSPOT_PORTAL_ID = import.meta.env.VITE_HUBSPOT_PORTAL_ID || import.meta.env.HUBSPOT_PORTAL_ID || "";

// HubSpot Form GUID (replace with your actual form GUID)
// Try both with and without VITE_ prefix for compatibility
const HUBSPOT_FORM_GUID = import.meta.env.VITE_HUBSPOT_FORM_GUID || import.meta.env.HUBSPOT_FORM_GUID || "";

// HubSpot Form Submission URL
// Format: https://api.hsforms.com/submissions/v3/integration/submit/{portalId}/{formId}
const HUBSPOT_SUBMIT_URL =
  HUBSPOT_PORTAL_ID && HUBSPOT_FORM_GUID
    ? `https://api.hsforms.com/submissions/v3/integration/submit/${HUBSPOT_PORTAL_ID}/${HUBSPOT_FORM_GUID}`
    : null;

// ============================================
// HUBSPOT FORM FIELD MAPPING
// ============================================
// Map your form fields to HubSpot field names
// You can find field names in HubSpot > Forms > Your Form > Fields
// Common field names:
// - firstname, lastname, email, company, website, phone, message
// ============================================

/**
 * Submit form data to HubSpot with Azure fallback
 * @param {Object} formData - Form data object with name, company, website, email, message, phone
 * @param {string} formType - Type of form (e.g., "contact", "sms-opt-in")
 * @returns {Promise} Axios response or Azure response
 */
export const submitToHubSpot = async (formData, formType = "contact") => {
  // Check if HubSpot is configured
  if (!HUBSPOT_SUBMIT_URL) {
    // If HubSpot is not configured, try Azure fallback
    if (isAzureConfigured()) {
      console.warn("HubSpot not configured, using Azure fallback");
      return await saveToAzureTable(
        formData,
        formType,
        "HubSpot not configured"
      );
    }
    throw new Error(
      "HubSpot is not configured. Please set HUBSPOT_PORTAL_ID and HUBSPOT_FORM_GUID environment variables."
    );
  }

  try {
    // Map form fields to HubSpot format
    // Adjust field names based on your HubSpot form configuration
    const fields = [];
    
    if (formData.name) {
      fields.push({
        name: "firstname",
        value: formData.name.split(" ")[0] || formData.name,
      });
      const lastName = formData.name.split(" ").slice(1).join(" ");
      if (lastName) {
        fields.push({
          name: "lastname",
          value: lastName,
        });
      }
    }
    
    if (formData.email) {
      fields.push({
        name: "email",
        value: formData.email,
      });
    }
    
    if (formData.company) {
      fields.push({
        name: "company",
        value: formData.company,
      });
    }
    
    if (formData.website) {
      fields.push({
        name: "website",
        value: formData.website,
      });
    }
    
    if (formData.phone) {
      fields.push({
        name: "phone",
        value: formData.phone,
      });
    }

    const hubspotData = {
      fields: fields,
      // Optional: Add context about the submission
      context: {
        pageUri: typeof window !== "undefined" ? window.location.href : "",
        pageName: typeof document !== "undefined" ? document.title : "",
      },
      // Optional: Legal consent (GDPR compliance)
      legalConsentOptions: {
        consent: {
          consentToProcess: true,
          text: "I agree to the privacy policy",
          communications: [
            {
              value: true,
              subscriptionTypeId: 999, // Replace with your subscription type ID
              text: "I agree to receive marketing communications",
            },
          ],
        },
      },
    };

    const response = await axios.post(HUBSPOT_SUBMIT_URL, hubspotData, {
      headers: {
        "Content-Type": "application/json",
      },
    });

    return response.data;
  } catch (error) {
    // HubSpot failed, try Azure fallback
    let errorMessage = "Unknown error";
    
    if (error.response) {
      // HubSpot returned an error response
      errorMessage = error.response.data?.message ||
        `HubSpot error: ${error.response.status} ${error.response.statusText}`;
    } else if (error.request) {
      // Request was made but no response received (network error, blocked request, etc.)
      errorMessage = "Network error: Unable to reach HubSpot. Please check your connection.";
    } else {
      // Something else happened (CORS, timeout, etc.)
      errorMessage = error.message || "An unexpected error occurred";
    }

    // Attempt Azure fallback
    if (isAzureConfigured()) {
      try {
        const azureResult = await saveToAzureTable(formData, formType, errorMessage);
        return {
          ...azureResult,
          hubspotFailed: true,
          fallbackUsed: true,
        };
      } catch (azureError) {
        // Both HubSpot and Azure failed
        throw new Error(
          `Both HubSpot and Azure fallback failed. HubSpot error: ${errorMessage}. Azure error: ${azureError.message}`
        );
      }
    }

    // No Azure fallback configured, throw the original error
    throw new Error(errorMessage);
  }
};
