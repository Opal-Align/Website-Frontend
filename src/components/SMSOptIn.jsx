import { useState } from "react";
// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";

export default function SMSOptIn() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
  });

  const [errors, setErrors] = useState({
    name: "",
    email: "",
    phone: "",
  });

  const [touched, setTouched] = useState({
    name: false,
    email: false,
    phone: false,
  });

  const [consentChecked, setConsentChecked] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const validateField = (name, value) => {
    switch (name) {
      case "name":
        return value.trim() === "" ? "Name is required" : "";
      case "email": {
        if (value.trim() === "") return ""; // Email is optional
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return !emailPattern.test(value) ? "Please enter a valid email" : "";
      }
      case "phone": {
        if (value.trim() === "") return "Phone number is required";
        const phonePattern = /^[\d\s\-()+]+$/;
        if (!phonePattern.test(value)) return "Please enter a valid phone number";
        const digitsOnly = value.replace(/\D/g, "");
        if (digitsOnly.length < 10) return "Phone number must be at least 10 digits";
        return "";
      }
      default:
        return "";
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (touched[name]) {
      setErrors({ ...errors, [name]: validateField(name, value) });
    }
  };

  const handleBlur = (name) => {
    setTouched({ ...touched, [name]: true });
    setErrors({ ...errors, [name]: validateField(name, formData[name]) });
  };

  const isFormValid = () => {
    return (
      formData.name.trim() !== "" &&
      formData.phone.trim() !== "" &&
      !errors.name &&
      !errors.phone &&
      !errors.email &&
      consentChecked
    );
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setTouched({ name: true, email: true, phone: true });
    const newErrors = {
      name: validateField("name", formData.name),
      email: validateField("email", formData.email),
      phone: validateField("phone", formData.phone),
    };
    setErrors(newErrors);

    if (Object.values(newErrors).every((error) => error === "") && consentChecked) {
      // Console log the form data
      const submissionData = {
        ...formData,
        smsOptIn: true,
        consentChecked: true,
      };
      console.log("SMS Opt In Form Data:", submissionData);

      // Show success message
      setIsSubmitted(true);

      // Clear the form
      setFormData({ name: "", email: "", phone: "" });
      setTouched({ name: false, email: false, phone: false });
      setErrors({ name: "", email: "", phone: "" });
      setConsentChecked(false);

      // Hide success message after 5 seconds
      setTimeout(() => {
        setIsSubmitted(false);
      }, 5000);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center px-8 py-8">
      <div className="max-w-full w-full">
        {/* Header Section with Form */}
        <div className="flex flex-col md:flex-row gap-[20vw] md:mr-4">
          <div className="flex gap-2 mb-6 md:mb-0">
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
              <path
                d="M16 2L18.5 13.5L30 16L18.5 18.5L16 30L13.5 18.5L2 16L13.5 13.5L16 2Z"
                fill="black"
                stroke="black"
                strokeWidth="1"
              />
            </svg>
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
              <path
                d="M16 2L18.5 13.5L30 16L18.5 18.5L16 30L13.5 18.5L2 16L13.5 13.5L16 2Z"
                fill="black"
                stroke="black"
                strokeWidth="1"
              />
            </svg>
          </div>

          {/* Content Column */}
          <div className="flex-1 md:max-w-3/4">
            {/* Header Row */}
            <div className="grid md:grid-cols-2 md:gap-32 mb-4">
              <div className="relative overflow-hidden mb-4">
                <motion.h1
                  initial={{ y: "-100%", opacity: 0 }}
                  animate={{ y: "0%", opacity: 1 }}
                  transition={{
                    delay: 0.3,
                    duration: 0.9,
                    ease: [0.25, 0.1, 0.25, 1],
                  }}
                  className="text-4xl md:text-5xl font-bold leading-tight text-gray-900"
                >
                  SMS
                  <br />
                  OPT IN
                </motion.h1>
              </div>
              <div className="relative overflow-hidden">
                <motion.p
                  initial={{ y: "-100%", opacity: 0 }}
                  animate={{ y: "0%", opacity: 1 }}
                  transition={{
                    delay: 0.3,
                    duration: 0.9,
                    ease: [0.25, 0.1, 0.25, 1],
                  }}
                  className="text-gray-500 text-base md:text-lg leading-relaxed"
                >
                  Opt in to receive SMS messages and appointment reminders from Opal Align.
                </motion.p>
              </div>
            </div>

            {/* Form Fields */}
            <form onSubmit={handleSubmit} className="space-y-8 md:col-span-2">
              {/* Success Message */}
              {isSubmitted && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6"
                >
                  <div className="flex items-center gap-3">
                    <svg
                      className="w-5 h-5 text-green-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    <p className="text-green-800 text-sm md:text-base font-medium">
                      Thank you! You have successfully opted in to receive SMS messages.
                    </p>
                  </div>
                </motion.div>
              )}

              {/* Name Field */}
              <div>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  onBlur={() => handleBlur("name")}
                  placeholder="Your name *"
                  className={`w-full bg-transparent border-b-2 ${
                    errors.name && touched.name
                      ? "border-red-500"
                      : "border-gray-300"
                  } py-4 px-0 text-gray-800 placeholder-gray-400 focus:outline-none focus:border-black transition-colors text-lg`}
                />
                {errors.name && touched.name && (
                  <motion.p
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-red-500 text-sm mt-2"
                  >
                    {errors.name}
                  </motion.p>
                )}
              </div>

              {/* Email Field */}
              <div>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  onBlur={() => handleBlur("email")}
                  placeholder="Email Address"
                  className={`w-full bg-transparent border-b-2 ${
                    errors.email && touched.email
                      ? "border-red-500"
                      : "border-gray-300"
                  } py-4 px-0 text-gray-800 placeholder-gray-400 focus:outline-none focus:border-black transition-colors text-lg`}
                />
                {errors.email && touched.email && (
                  <motion.p
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-red-500 text-sm mt-2"
                  >
                    {errors.email}
                  </motion.p>
                )}
              </div>

              {/* Phone Field */}
              <div>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  onBlur={() => handleBlur("phone")}
                  placeholder="Phone Number *"
                  className={`w-full bg-transparent border-b-2 ${
                    errors.phone && touched.phone
                      ? "border-red-500"
                      : "border-gray-300"
                  } py-4 px-0 text-gray-800 placeholder-gray-400 focus:outline-none focus:border-black transition-colors text-lg`}
                />
                {errors.phone && touched.phone && (
                  <motion.p
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-red-500 text-sm mt-2"
                  >
                    {errors.phone}
                  </motion.p>
                )}
              </div>

              {/* Information Bullets */}
              <div className="space-y-2 text-gray-500 text-sm">
                <p>- Message frequency may vary</p>
                <p>- Messaging & Data rates may apply</p>
                <p>- Text HELP for help. Text STOP to opt out</p>
              </div>

              {/* Consent Checkbox */}
              <div className="flex items-start gap-3">
                <input
                  type="checkbox"
                  id="consent"
                  checked={consentChecked}
                  onChange={(e) => setConsentChecked(e.target.checked)}
                  className="mt-1 w-5 h-5 text-gray-900 border-gray-300 rounded focus:ring-gray-900"
                />
                <label
                  htmlFor="consent"
                  className="text-gray-500 text-sm cursor-pointer"
                >
                  By checking this box you agree to receive texts and appointment
                  reminders from Opal Align to the number provided
                </label>
              </div>

              <div className="grid md:grid-cols-2 gap-8 items-end pt-8">
                <div>
                  <p className="text-sm text-gray-500">
                    By providing your contact information, you acknowledge
                    and agree to our{" "}
                    <a
                      href="/privacy-policy"
                      className="underline cursor-pointer hover:text-black transition-colors"
                    >
                      Privacy Policy
                    </a>
                    .
                  </p>
                  {/* reCAPTCHA Notice */}
                  <p className="text-gray-500 text-xs mt-4">
                    This site is protected by reCAPTCHA and the Google{" "}
                    <a
                      href="https://policies.google.com/privacy"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="underline hover:text-black transition-colors"
                    >
                      Privacy Policy
                    </a>{" "}
                    and{" "}
                    <a
                      href="https://policies.google.com/terms"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="underline hover:text-black transition-colors"
                    >
                      Terms of Service
                    </a>{" "}
                    apply.
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 justify-end">
                  <motion.button
                    type="submit"
                    disabled={!isFormValid() || isSubmitted}
                    className={`px-8 py-4 rounded-full font-medium transition-colors flex items-center justify-center gap-2 ${
                      isFormValid() && !isSubmitted
                        ? isSubmitted
                          ? "bg-green-600 text-white"
                          : "bg-black text-white hover:bg-gray-800"
                        : "bg-gray-400 text-white cursor-not-allowed"
                    }`}
                    whileHover={
                      isFormValid() && !isSubmitted
                        ? { scale: 1.02 }
                        : {}
                    }
                    whileTap={
                      isFormValid() && !isSubmitted
                        ? { scale: 0.98 }
                        : {}
                    }
                  >
                    {isSubmitted ? (
                      <>
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                        Submitted!
                      </>
                    ) : (
                      <>
                        Submit
                        <span className="flex gap-1">
                          <span className="w-2 h-2 bg-white rounded-full"></span>
                          <span className="w-2 h-2 bg-white rounded-full"></span>
                        </span>
                      </>
                    )}
                  </motion.button>
                </div>
              </div>

            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

