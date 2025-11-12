import axios from "axios";

// ============================================
// HUBSPOT CONFIGURATION
// ============================================
// Replace these with your actual HubSpot details:
// 1. HubSpot Portal ID: Found in HubSpot Settings > Integrations > Private Apps
// 2. HubSpot Form GUID: Found in HubSpot > Marketing > Forms > Your Form > Settings
// 3. HubSpot API Key (optional): If using API key authentication
// ============================================

// HubSpot Portal ID (replace with your actual portal ID)
const HUBSPOT_PORTAL_ID = import.meta.env.VITE_HUBSPOT_PORTAL_ID || "";

// HubSpot Form GUID (replace with your actual form GUID)
const HUBSPOT_FORM_GUID = import.meta.env.VITE_HUBSPOT_FORM_GUID || "";

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
 * Submit form data to HubSpot
 * @param {Object} formData - Form data object with name, company, website, email
 * @returns {Promise} Axios response
 */
export const submitToHubSpot = async (formData) => {
  // Check if HubSpot is configured
  if (!HUBSPOT_SUBMIT_URL) {
    throw new Error(
      "HubSpot is not configured. Please set VITE_HUBSPOT_PORTAL_ID and VITE_HUBSPOT_FORM_GUID environment variables."
    );
  }

  try {
    // Map form fields to HubSpot format
    // Adjust field names based on your HubSpot form configuration
    const hubspotData = {
      fields: [
        {
          name: "firstname", // HubSpot field name
          value: formData.name.split(" ")[0] || formData.name, // First name or full name
        },
        {
          name: "lastname", // HubSpot field name (optional)
          value: formData.name.split(" ").slice(1).join(" ") || "", // Last name if available
        },
        {
          name: "email", // HubSpot field name
          value: formData.email,
        },
        {
          name: "company", // HubSpot field name
          value: formData.company,
        },
        {
          name: "website", // HubSpot field name
          value: formData.website,
        },
      ],
      // Optional: Add context about the submission
      context: {
        pageUri: window.location.href,
        pageName: document.title,
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
    // Handle different error types
    if (error.response) {
      // HubSpot returned an error response
      throw new Error(
        error.response.data?.message ||
          `HubSpot error: ${error.response.status} ${error.response.statusText}`
      );
    } else if (error.request) {
      // Request was made but no response received
      throw new Error(
        "Network error: Unable to reach HubSpot. Please check your connection."
      );
    } else {
      // Something else happened
      throw new Error(error.message || "An unexpected error occurred");
    }
  }
};
