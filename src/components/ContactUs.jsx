import { useState } from "react";
// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";
import { useMutation } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { MdCall } from "react-icons/md";
import { MdEmail } from "react-icons/md";
import { submitToHubSpot } from "../services/hubspotService.js";

export default function ContactUs() {
  const [formData, setFormData] = useState({
    name: "",
    company: "",
    website: "",
    email: "",
  });

  const [errors, setErrors] = useState({
    name: "",
    company: "",
    website: "",
    email: "",
  });

  const [touched, setTouched] = useState({
    name: false,
    company: false,
    website: false,
    email: false,
  });

  // ============================================
  // REACT QUERY MUTATION FOR HUBSPOT SUBMISSION
  // ============================================
  const hubspotMutation = useMutation({
    mutationFn: submitToHubSpot,
    onSuccess: (data) => {
      console.log("Form submitted successfully to HubSpot:", data);
      // Reset form on success
      setFormData({ name: "", company: "", website: "", email: "" });
      setTouched({ name: false, company: false, website: false, email: false });
      setErrors({ name: "", company: "", website: "", email: "" });

      // Auto-reset success state after 5 seconds
      setTimeout(() => {
        hubspotMutation.reset();
      }, 5000);
    },
    onError: (error) => {
      console.error("Error submitting to HubSpot:", error);
      // Auto-reset error state after 8 seconds
      setTimeout(() => {
        hubspotMutation.reset();
      }, 8000);
    },
  });

  // Validate individual field
  const validateField = (name, value) => {
    switch (name) {
      case "name":
        return value.trim() === "" ? "Name is required" : "";
      case "company":
        return value.trim() === "" ? "Company name is required" : "";
      case "website": {
        if (value.trim() === "") return "Website is required";
        const urlPattern =
          /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/;
        return !urlPattern.test(value) ? "Please enter a valid URL" : "";
      }
      case "email": {
        if (value.trim() === "") return "Email is required";
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return !emailPattern.test(value) ? "Please enter a valid email" : "";
      }
      default:
        return "";
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    // Validate on change if field was touched
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
      formData.company.trim() !== "" &&
      formData.website.trim() !== "" &&
      formData.email.trim() !== "" &&
      !errors.name &&
      !errors.company &&
      !errors.website &&
      !errors.email
    );
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Mark all fields as touched
    setTouched({ name: true, company: true, website: true, email: true });

    // Validate all fields
    const newErrors = {
      name: validateField("name", formData.name),
      company: validateField("company", formData.company),
      website: validateField("website", formData.website),
      email: validateField("email", formData.email),
    };
    setErrors(newErrors);

    // Only submit if no errors
    if (Object.values(newErrors).every((error) => error === "")) {
      // Submit to HubSpot using React Query mutation
      hubspotMutation.mutate(formData);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Video Background */}
      <div className="absolute inset-0 w-full h-full">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
        >
          <source
            src="https://framerusercontent.com/assets/XR85lzld6QlWDzCJZj9Q3EXIs.mp4"
            type="video/mp4"
          />
        </video>
        {/* Dark overlay for better text readability */}
        <div className="absolute inset-0 bg-black/70" />
      </div>

      {/* Content */}
      <div className="relative z-10 min-h-screen flex items-center px-8 py-8">
        <div className="max-w-full w-full">
          {/* Header Section with Form */}
          <div className="flex flex-col md:flex-row md:gap-[20vw] gap-[12vw] md:mr-4">
            <Link to="/" className="mb-6 md:mb-0">
              <motion.div 
                className="flex items-center gap-3 text-white hover:text-white/80 transition-colors cursor-pointer group"
                whileHover={{ x: -5 }}
                transition={{ duration: 0.2 }}
              >
                <svg 
                  width="24" 
                  height="24" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="2"
                  className="group-hover:translate-x-[-4px] transition-transform"
                >
                  <path d="M19 12H5M5 12L12 19M5 12L12 5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <span className="text-base md:text-lg font-medium">Back to Home</span>
              </motion.div>
            </Link>

            {/* Content Column */}
            <div className="flex-1 md:max-w-3/4">
              {/* Header Row */}
              <div className="grid md:grid-cols-2 md:gap-32 mb-8">
                <div className="relative overflow-hidden">
                  <motion.div
                    initial={{ y: "-100%", opacity: 0 }}
                    animate={{ y: "0%", opacity: 1 }}
                    transition={{
                      delay: 0.3,
                      duration: 0.9,
                      ease: [0.25, 0.1, 0.25, 1],
                    }}
                    className="space-y-4"
                  >
                    <p className="text-white/70 text-base md:text-lg leading-relaxed">
                      Due to high demand, DEMO availability is limited. Request your invitation now before slots fill up.
                    </p>
                    <div className="space-y-3 text-white">
                      <a
                        href="tel:8779966725"
                        className="flex items-center gap-3 text-base md:text-lg hover:text-white/80 transition-colors"
                      >
                        <MdCall className="w-5 h-5 md:w-6 md:h-6 shrink-0" />
                        <span>877-996-6725 (OPAL)</span>
                      </a>
                      <a
                        href="mailto:info@opalgos.com"
                        className="flex items-center gap-3 text-base md:text-lg hover:text-white/80 transition-colors"
                      >
                        <MdEmail className="w-5 h-5 md:w-6 md:h-6 shrink-0" />
                        <span>info@opalgos.com</span>
                      </a>
                    </div>
                  </motion.div>
                </div>
              </div>

              {/* Form Fields */}
              <form onSubmit={handleSubmit} className="space-y-8 md:col-span-2">
                {/* Success Message */}
                {hubspotMutation.isSuccess && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-green-500/20 border border-green-400/50 rounded-lg p-4 mb-6"
                  >
                    <div className="flex items-center gap-3">
                      <svg
                        className="w-5 h-5 text-green-400"
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
                      <p className="text-green-400 font-medium">
                        We will be in touch!
                      </p>
                    </div>
                  </motion.div>
                )}

                {/* Error Message */}
                {hubspotMutation.isError && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-red-500/20 border border-red-400/50 rounded-lg p-4 mb-6"
                  >
                    <div className="flex items-center gap-3">
                      <svg
                        className="w-5 h-5 text-red-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                      <p className="text-red-400 font-medium">
                        Failed to submit. Please try again.
                      </p>
                    </div>
                  </motion.div>
                )}

                <div>
                  <input
                    type="text"
                    name="name"
                    placeholder="Your name *"
                    value={formData.name}
                    onChange={handleChange}
                    onBlur={() => handleBlur("name")}
                    className={`w-full bg-transparent border-b-2 py-4 px-0 text-white placeholder-white/50 focus:outline-none transition-colors text-lg ${
                      errors.name && touched.name
                        ? "border-red-400"
                        : "border-white/30 focus:border-white"
                    }`}
                  />
                  {errors.name && touched.name && (
                    <motion.p
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-red-400 text-sm mt-2 flex items-center gap-1"
                    >
                      <span className="inline-block w-1 h-1 bg-red-400 rounded-full animate-pulse" />
                      {errors.name}
                    </motion.p>
                  )}
                </div>

                <div>
                  <input
                    type="text"
                    name="company"
                    placeholder="Company Name *"
                    value={formData.company}
                    onChange={handleChange}
                    onBlur={() => handleBlur("company")}
                    className={`w-full bg-transparent border-b-2 py-4 px-0 text-white placeholder-white/50 focus:outline-none transition-colors text-lg ${
                      errors.company && touched.company
                        ? "border-red-400"
                        : "border-white/30 focus:border-white"
                    }`}
                  />
                  {errors.company && touched.company && (
                    <motion.p
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-red-400 text-sm mt-2 flex items-center gap-1"
                    >
                      <span className="inline-block w-1 h-1 bg-red-400 rounded-full animate-pulse" />
                      {errors.company}
                    </motion.p>
                  )}
                </div>

                <div>
                  <input
                    type="url"
                    name="website"
                    placeholder="Company Website *"
                    value={formData.website}
                    onChange={handleChange}
                    onBlur={() => handleBlur("website")}
                    className={`w-full bg-transparent border-b-2 py-4 px-0 text-white placeholder-white/50 focus:outline-none transition-colors text-lg ${
                      errors.website && touched.website
                        ? "border-red-400"
                        : "border-white/30 focus:border-white"
                    }`}
                  />
                  {errors.website && touched.website && (
                    <motion.p
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-red-400 text-sm mt-2 flex items-center gap-1"
                    >
                      <span className="inline-block w-1 h-1 bg-red-400 rounded-full animate-pulse" />
                      {errors.website}
                    </motion.p>
                  )}
                </div>

                <div>
                  <input
                    type="email"
                    name="email"
                    placeholder="Email *"
                    value={formData.email}
                    onChange={handleChange}
                    onBlur={() => handleBlur("email")}
                    className={`w-full bg-transparent border-b-2 py-4 px-0 text-white placeholder-white/50 focus:outline-none transition-colors text-lg ${
                      errors.email && touched.email
                        ? "border-red-400"
                        : "border-white/30 focus:border-white"
                    }`}
                  />
                  {errors.email && touched.email && (
                    <motion.p
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-red-400 text-sm mt-2 flex items-center gap-1"
                    >
                      <span className="inline-block w-1 h-1 bg-red-400 rounded-full animate-pulse" />
                      {errors.email}
                    </motion.p>
                  )}
                </div>

                <div className="pt-8">
                  <motion.button
                    type="submit"
                    disabled={!isFormValid() || hubspotMutation.isPending}
                    className={`px-8 py-4 rounded-full font-medium transition-colors flex items-center justify-center gap-2 ${
                      isFormValid() && !hubspotMutation.isPending
                        ? "bg-white text-black hover:bg-white/90"
                        : "bg-white/50 text-black/50 cursor-not-allowed"
                    }`}
                    whileHover={
                      isFormValid() && !hubspotMutation.isPending
                        ? { scale: 1.02 }
                        : {}
                    }
                    whileTap={
                      isFormValid() && !hubspotMutation.isPending
                        ? { scale: 0.98 }
                        : {}
                    }
                  >
                    {hubspotMutation.isPending ? (
                      <>
                        <svg
                          className="animate-spin h-5 w-5"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                        <span>Submitting...</span>
                      </>
                    ) : hubspotMutation.isSuccess ? (
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
                        <span>Submitted!</span>
                      </>
                    ) : (
                      <>
                        <span>Join Today</span>
                        <span className="flex gap-1">
                          <span className="w-2 h-2 bg-black rounded-full"></span>
                          <span className="w-2 h-2 bg-black rounded-full"></span>
                        </span>
                      </>
                    )}
                  </motion.button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
