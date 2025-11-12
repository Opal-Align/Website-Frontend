# HubSpot Form Integration Setup Guide

This guide will help you configure the Footer form to submit data to HubSpot.

## Prerequisites

- HubSpot account
- A HubSpot form created in your HubSpot account
- Form Portal ID and Form GUID

## Step-by-Step Setup

### 1. Get Your HubSpot Portal ID

1. Log in to your HubSpot account
2. Go to **Settings** (gear icon in the top right)
3. Navigate to **Integrations** > **Private Apps** (or check **Account Setup** > **Account Defaults**)
4. Your **Portal ID** is displayed there (it's a numeric ID like `12345678`)

### 2. Get Your HubSpot Form GUID

1. In HubSpot, go to **Marketing** > **Lead Capture** > **Forms**
2. Click on the form you want to use (or create a new one)
3. Click on the form name to open it
4. In the form settings, look for the **Form ID** or **GUID**
   - You can also find it in the form embed code
   - It looks like: `abc12345-def6-7890-ghij-klmnopqrstuv`
5. Copy this GUID

### 3. Configure Environment Variables

Create a `.env` file in your project root (if it doesn't exist) and add:

```env
VITE_HUBSPOT_PORTAL_ID=your_portal_id_here
VITE_HUBSPOT_FORM_GUID=your_form_guid_here
```

**Example:**

```env
VITE_HUBSPOT_PORTAL_ID=12345678
VITE_HUBSPOT_FORM_GUID=abc12345-def6-7890-ghij-klmnopqrstuv
```

### 4. Update HubSpot Form Field Mapping

Edit `/src/services/hubspotService.js` and update the field mapping in the `submitToHubSpot` function:

```javascript
const hubspotData = {
  fields: [
    {
      name: "firstname", // Replace with your HubSpot field name
      value: formData.name.split(" ")[0] || formData.name,
    },
    {
      name: "email", // Replace with your HubSpot field name
      value: formData.email,
    },
    {
      name: "company", // Replace with your HubSpot field name
      value: formData.company,
    },
    {
      name: "website", // Replace with your HubSpot field name
      value: formData.website,
    },
  ],
  // ... rest of the configuration
};
```

**To find your HubSpot field names:**

1. Go to your form in HubSpot
2. Click on a field to edit it
3. Check the **Field name** or **Internal name** (not the label)
4. Common field names: `firstname`, `lastname`, `email`, `company`, `website`, `phone`, `message`

### 5. Configure Legal Consent (Optional but Recommended)

If your form requires GDPR compliance or legal consent:

1. In `hubspotService.js`, update the `legalConsentOptions`:

   ```javascript
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
   ```

2. **To find your Subscription Type ID:**
   - Go to HubSpot **Settings** > **Marketing** > **Email** > **Subscriptions**
   - Click on a subscription type
   - The ID is in the URL or settings

### 6. Test the Integration

1. Start your development server: `npm run dev`
2. Fill out the Footer form
3. Submit the form
4. Check your HubSpot account to see if the submission appears:
   - Go to **Contacts** > **Contacts** to see new contacts
   - Go to **Marketing** > **Lead Capture** > **Forms** > Your Form > **Submissions** to see form submissions

## Troubleshooting

### Form submissions not appearing in HubSpot

1. **Check Portal ID and Form GUID:**

   - Verify they're correct in your `.env` file
   - Make sure there are no extra spaces or quotes

2. **Check field names:**

   - Ensure field names in `hubspotService.js` match your HubSpot form fields exactly
   - Field names are case-sensitive

3. **Check browser console:**

   - Open browser DevTools (F12)
   - Check the Console tab for error messages
   - Check the Network tab to see if the request is being sent

4. **Check HubSpot form settings:**
   - Make sure the form is **Active**
   - Check if the form has any restrictions (e.g., only accepting submissions from certain domains)

### CORS Errors

If you see CORS errors:

- HubSpot forms API should handle CORS automatically
- If issues persist, check if your form has domain restrictions in HubSpot

### Network Errors

- Check your internet connection
- Verify the HubSpot API endpoint is accessible
- Check if there are any firewall or security settings blocking the request

## API Endpoint Format

The HubSpot form submission endpoint follows this format:

```
https://api.hsforms.com/submissions/v3/integration/submit/{portalId}/{formGuid}
```

## Additional Resources

- [HubSpot Forms API Documentation](https://developers.hubspot.com/docs/api/marketing/forms)
- [HubSpot Form Field Types](https://developers.hubspot.com/docs/api/marketing/forms#field-types)
- [HubSpot Legal Consent Options](https://developers.hubspot.com/docs/api/marketing/forms#legal-consent-options)

## Notes

- The form automatically resets after successful submission
- Success/error messages auto-dismiss after a few seconds
- The form is disabled while submitting to prevent duplicate submissions
- All form data is validated before submission
