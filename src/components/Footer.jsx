import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { MdCall } from "react-icons/md";
import { MdEmail } from "react-icons/md";
import opalLogo from "../assets/OPALgos GreyWhite Website.png";

export default function Footer() {

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

            {/* Right side: Contact CTA */}
            <div className="space-y-6 md:space-y-8">
              <div className="space-y-2">
                <h2 className="text-white text-base md:text-lg font-medium">
                  Due to high demand, DEMO availability is limited.
                </h2>
                <p className="text-white/50 text-xs md:text-sm">
                  Request your invitation now before slots fill up.
                </p>
              </div>

              <Link to="/contact-us">
                <motion.button
                  className="w-full md:w-auto px-6 md:px-8 py-3 border border-white/30 rounded-full flex items-center justify-center md:justify-start gap-3 transition-all text-white hover:bg-white hover:text-black cursor-pointer"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <span>Join Today</span>
                  <span className="flex gap-1.5">
                    <span className="w-2 h-2 bg-current rounded-full"></span>
                    <span className="w-2 h-2 bg-current rounded-full"></span>
                  </span>
                </motion.button>
              </Link>
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
                <img 
                  src={opalLogo} 
                  alt="OPAL gOS" 
                  className="h-6 md:h-8 w-auto object-contain"
                />
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
