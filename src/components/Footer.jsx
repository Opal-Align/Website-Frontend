import { useState } from "react";
// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";
import { useMutation } from "@tanstack/react-query";
import { MdCall } from "react-icons/md";
import { MdEmail } from "react-icons/md";
import { submitToHubSpot } from "../services/hubspotService.js";

export default function Footer() {
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
    <footer className="relative w-full min-h-[50vh] overflow-hidden">
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

      {/* Content - Single Row Layout */}
      <div className="relative z-10 flex flex-col justify-between h-full">
        <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 md:px-16 py-12 md:py-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-start">
            {/* Left side: Contact Info */}
            <div className="space-y-6 md:space-y-8">
              <div className="h-10 md:h-12 w-12 border-t border-white/30" />
              <div className="space-y-3 md:space-y-4 text-white">
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
            </div>

            {/* Column 2: Navigation */}
            {/* <div className="space-y-6 md:space-y-8 col-span-1 order-1 md:order-0">
              <div className="h-10 md:h-12 flex items-end">
                <h3 className="text-white/60 text-xs md:text-sm uppercase tracking-wider">
                  Navigation
                </h3>
              </div>
              <div className="h-10 md:h-12 w-12 border-t border-white/30" />
              <nav className="space-y-2 md:space-y-3">
                {["Home", "Agency", "Projects", "Insights", "Contact"].map(
                  (item) => (
                    <motion.a
                      key={item}
                      href={`#${item.toLowerCase()}`}
                      className="block text-white text-lg md:text-xl font-light hover:text-white/80 transition-colors"
                      whileHover={{ x: 5 }}
                      transition={{ duration: 0.2 }}
                    >
                      {item}
                    </motion.a>
                  )
                )}
              </nav>
            </div> */}

            {/* Column 3: Social Links */}
            {/* <div className="space-y-6 md:space-y-8 md:pt-[88px] col-span-1 order-2 md:order-0 text-center md:text-left self-end md:self-start justify-self-center md:justify-self-auto mt-4">
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="block text-white/80 text-base md:text-lg hover:text-white transition-colors"
              >
                Twitter
              </a>
              <a
                href="https://behance.net"
                target="_blank"
                rel="noopener noreferrer"
                className="block text-white/80 text-base md:text-lg hover:text-white transition-colors"
              >
                Behance
              </a>
              <a
                href="https://dribbble.com"
                target="_blank"
                rel="noopener noreferrer"
                className="block text-white/80 text-base md:text-lg hover:text-white transition-colors"
              >
                Dribbble
              </a>
            </div> */}

            {/* Right side: Newsletter Form */}
            <div id="footer-contact-form" className="space-y-6 md:space-y-8">
              <div className="space-y-2">
                <h2 className="text-white text-base md:text-lg font-medium">
                  Due to high demand, DEMO availability is limited.
                </h2>
                <p className="text-white/50 text-xs md:text-sm">
                  Request your invitation now before slots fill up.
                </p>
              </div>
              <div className="h-10 md:h-12 w-12 border-t border-white/30" />

              {/* Urgency message */}

              <div className="space-y-4 md:space-y-6">
                <div>
                  <input
                    type="text"
                    name="name"
                    placeholder="Your name *"
                    value={formData.name}
                    onChange={handleChange}
                    onBlur={() => handleBlur("name")}
                    className={`w-full bg-transparent border-b py-3 text-base md:text-lg focus:outline-none transition-colors ${
                      errors.name && touched.name
                        ? "border-red-400 text-white placeholder-red-300"
                        : "border-white/30 text-white placeholder-white/50 focus:border-white"
                    }`}
                  />
                  {errors.name && touched.name && (
                    <motion.p
                      initial={{ opacity: 0, y: -10, rotate: -5, scale: 0.8 }}
                      animate={{ opacity: 1, y: 0, rotate: 0, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      transition={{
                        duration: 0.4,
                        ease: [0.34, 1.56, 0.64, 1],
                      }}
                      className="text-white text-xs mt-1 flex items-center gap-1"
                    >
                      <span className="inline-block w-1 h-1 bg-white rounded-full animate-pulse" />
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
                    className={`w-full bg-transparent border-b py-3 text-base md:text-lg focus:outline-none transition-colors ${
                      errors.company && touched.company
                        ? "border-red-400 text-white placeholder-red-300"
                        : "border-white/30 text-white placeholder-white/50 focus:border-white"
                    }`}
                  />
                  {errors.company && touched.company && (
                    <motion.p
                      initial={{ opacity: 0, y: -10, rotate: -5, scale: 0.8 }}
                      animate={{ opacity: 1, y: 0, rotate: 0, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      transition={{
                        duration: 0.4,
                        ease: [0.34, 1.56, 0.64, 1],
                      }}
                      className="text-white text-xs mt-1 flex items-center gap-1"
                    >
                      <span className="inline-block w-1 h-1 bg-white rounded-full animate-pulse" />
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
                    className={`w-full bg-transparent border-b py-3 text-base md:text-lg focus:outline-none transition-colors ${
                      errors.website && touched.website
                        ? "border-red-400 text-white placeholder-red-300"
                        : "border-white/30 text-white placeholder-white/50 focus:border-white"
                    }`}
                  />
                  {errors.website && touched.website && (
                    <motion.p
                      initial={{ opacity: 0, y: -10, rotate: -5, scale: 0.8 }}
                      animate={{ opacity: 1, y: 0, rotate: 0, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      transition={{
                        duration: 0.4,
                        ease: [0.34, 1.56, 0.64, 1],
                      }}
                      className="text-white text-xs mt-1 flex items-center gap-1"
                    >
                      <span className="inline-block w-1 h-1 bg-white rounded-full animate-pulse" />
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
                    className={`w-full bg-transparent border-b py-3 text-base md:text-lg focus:outline-none transition-colors ${
                      errors.email && touched.email
                        ? "border-red-400 text-white placeholder-red-300"
                        : "border-white/30 text-white placeholder-white/50 focus:border-white"
                    }`}
                  />
                  {errors.email && touched.email && (
                    <motion.p
                      initial={{ opacity: 0, y: -10, rotate: -5, scale: 0.8 }}
                      animate={{ opacity: 1, y: 0, rotate: 0, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      transition={{
                        duration: 0.4,
                        ease: [0.34, 1.56, 0.64, 1],
                      }}
                      className="text-white text-xs mt-1 flex items-center gap-1"
                    >
                      <span className="inline-block w-1 h-1 bg-white rounded-full animate-pulse" />
                      {errors.email}
                    </motion.p>
                  )}
                </div>

                {/* Success Message */}
                {hubspotMutation.isSuccess && (
                  <motion.p
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-green-400 text-xs md:text-sm flex items-center gap-2"
                  >
                    <svg
                      className="w-4 h-4"
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
                    We will be in touch!
                  </motion.p>
                )}

                {/* Error Message */}
                {hubspotMutation.isError && (
                  <motion.p
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-red-400 text-xs md:text-sm flex items-center gap-2"
                  >
                    <svg
                      className="w-4 h-4"
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
                    Failed to submit. Please try again.
                  </motion.p>
                )}

                <motion.button
                  onClick={handleSubmit}
                  disabled={!isFormValid() || hubspotMutation.isPending}
                  className={`w-full md:w-auto px-6 md:px-8 py-3 border rounded-full flex items-center justify-center md:justify-start gap-3 transition-all ${
                    isFormValid() && !hubspotMutation.isPending
                      ? "border-white/30 text-white hover:bg-white hover:text-black cursor-pointer"
                      : "border-white/30 text-white cursor-not-allowed opacity-50"
                  }`}
                  whileHover={
                    isFormValid() && !hubspotMutation.isPending
                      ? { scale: 1.05 }
                      : {}
                  }
                  whileTap={
                    isFormValid() && !hubspotMutation.isPending
                      ? { scale: 0.95 }
                      : {}
                  }
                >
                  {hubspotMutation.isPending ? (
                    <>
                      <svg
                        className="animate-spin h-5 w-5 text-white"
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
                      <span className="flex gap-1.5">
                        <span className="w-2 h-2 bg-current rounded-full"></span>
                        <span className="w-2 h-2 bg-current rounded-full"></span>
                      </span>
                    </>
                  )}
                </motion.button>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Footer Line */}
        <div className="relative z-10 border-t border-white/10 bg-black/40">
          <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 md:px-16 py-4 md:py-6">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 md:gap-8 text-white/60 text-xs md:text-sm">
              {/* Left: Copyright */}
              <div className="flex flex-col md:flex-row items-start md:items-center gap-2 md:gap-4">
                {/* <span>© 2025</span>
                <span className="hidden md:inline">•</span> */}
                <span>OPAL gOS</span>
              </div>
              <div className="flex flex-wrap items-center gap-4 md:gap-6">
                © 2025 OPAL gOS. All rights reserved
              </div>
              {/* Center: Policy Links */}
              <div className="flex flex-wrap items-center gap-4 md:gap-6">
                <a
                  href="/sms-opt-in"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition-colors"
                >
                  SMS Opt In
                </a>
                <span className="text-white/60">|</span>
                <a
                  href="/privacy-policy"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition-colors"
                >
                  Privacy Policy
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
