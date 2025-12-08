import { useState } from "react";
// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";
import { useMutation } from "@tanstack/react-query";
import { submitToHubSpot } from "../../services/hubspotService.js";
import FormHeader from "./FormHeader";
export default function ContactForm() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });

  const [errors, setErrors] = useState({
    name: "",
    email: "",
    message: "",
  });

  const [touched, setTouched] = useState({
    name: false,
    email: false,
    message: false,
  });

  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState("");

  // HubSpot mutation with Azure fallback
  const hubspotMutation = useMutation({
    mutationFn: (formData) => submitToHubSpot(formData, "contact"),
    onSuccess: () => {
      setIsSubmitted(true);
      setSubmitError("");
      setTimeout(() => {
        setFormData({ name: "", email: "", message: "" });
        setIsSubmitted(false);
        setTouched({ name: false, email: false, message: false });
      }, 2000);
    },
    onError: () => {
      setSubmitError("Failed to submit. Please try again.");
      setIsSubmitted(false);
    },
  });

  const validateName = (name) => {
    if (!name.trim()) {
      return "Name is required";
    }
    if (name.trim().length < 2) {
      return "Name must be at least 2 characters";
    }
    return "";
  };

  const validateEmail = (email) => {
    if (!email.trim()) {
      return "Email is required";
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return "Please enter a valid email address";
    }
    return "";
  };

  const validateMessage = (message) => {
    if (!message.trim()) {
      return "Message is required";
    }
    if (message.trim().length < 10) {
      return "Message must be at least 10 characters";
    }
    return "";
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (touched[name]) {
      let error = "";
      if (name === "name") error = validateName(value);
      if (name === "email") error = validateEmail(value);
      if (name === "message") error = validateMessage(value);
      setErrors((prev) => ({ ...prev, [name]: error }));
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));

    let error = "";
    if (name === "name") error = validateName(value);
    if (name === "email") error = validateEmail(value);
    if (name === "message") error = validateMessage(value);
    setErrors((prev) => ({ ...prev, [name]: error }));
  };

  const handleSubmit = () => {
    const nameError = validateName(formData.name);
    const emailError = validateEmail(formData.email);
    const messageError = validateMessage(formData.message);

    setErrors({
      name: nameError,
      email: emailError,
      message: messageError,
    });

    setTouched({
      name: true,
      email: true,
      message: true,
    });

    if (!nameError && !emailError && !messageError) {
      setSubmitError("");
      hubspotMutation.mutate(formData);
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
            <FormHeader />

            {/* Error Message */}
            {submitError && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg"
              >
                <p className="text-red-600 text-sm">{submitError}</p>
              </motion.div>
            )}

            {/* Form Fields */}
            <div className="space-y-8 md:col-span-2">
              <div>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  onBlur={handleBlur}
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

              <div>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="Email *"
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

              <div>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="Your message"
                  rows="4"
                  className={`w-full bg-transparent border-b-2 ${
                    errors.message && touched.message
                      ? "border-red-500"
                      : "border-gray-300"
                  } py-4 px-0 text-gray-800 placeholder-gray-400 focus:outline-none focus:border-black transition-colors resize-none text-lg`}
                />
                {errors.message && touched.message && (
                  <motion.p
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-red-500 text-sm mt-2"
                  >
                    {errors.message}
                  </motion.p>
                )}
              </div>

              <div className="grid md:grid-cols-2 gap-8 items-end pt-8">
                <div>
                  <p className="text-lg font-medium mb-4">
                    If you're ready to shape the future with us,
                    <br />
                    your journey could start here.
                  </p>
                  <p className="text-sm text-gray-500">
                    By providing Astra your contact information, you acknowledge
                    and agree to our{" "}
                    <span className="underline cursor-pointer hover:text-black transition-colors">
                      Privacy Policy
                    </span>
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 justify-end">
                  <motion.button
                    type="button"
                    onClick={handleSubmit}
                    disabled={isSubmitted || hubspotMutation.isPending}
                    className={`px-8 py-4 rounded-full font-medium transition-colors flex items-center justify-center gap-2 ${
                      isSubmitted
                        ? "bg-green-600 text-white"
                        : "bg-black text-white hover:bg-gray-800"
                    } ${hubspotMutation.isPending ? "opacity-50 cursor-not-allowed" : ""}`}
                    whileHover={isSubmitted || hubspotMutation.isPending ? {} : { scale: 1.02 }}
                    whileTap={isSubmitted || hubspotMutation.isPending ? {} : { scale: 0.98 }}
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
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
