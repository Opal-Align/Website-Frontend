import "./App.css";
import Navbar from "./components/Navbar/Navbar";
import HomePage from "./components/HomePage";
import StatsSection from "./components/Info/StatsSection";
import ContactForm from "./components/Form/ContactForm";
import Services from "./components/Info/Services";
import UserData from "./components/Info/UserData";
import Footer from "./components/Footer";
import FAQ from "./components/FAQ/FAQ";
import LogoStream from "./components/LogoStream/LogoStream";
function App() {
  return (
    <>
      <div className="h-screen overflow-hidden">
        <HomePage />
        <Navbar />
      </div>
      {/* <div>
        <StatsSection />
      </div> */}
      <div>
        <Services />
      </div>
      <div>
        <LogoStream />
      </div>
      {/* <div>
        <UserData />
      </div> */}
      {/* <div>
        <ContactForm />
      </div> */}
      <div>
        <div>
          <FAQ />
        </div>
        <Footer />
      </div>
    </>
  );
}

export default App;

//  export default function App() {
//   const [currentPage, setCurrentPage] = useState(0);
//   const [direction, setDirection] = useState("down");
//   const [isTransitioning, setIsTransitioning] = useState(false);
//   const containerRef = useRef(null);

//   const pages = [
//     <HomePage key="home" />,
//     <StatsSection key="stats" />,
//     <Services key="services" />,
//     <ContactForm key="contact" />,
//   ];

//   useEffect(() => {
//     let touchStart = 0;
//     let scrollTimeout;

//     const handleWheel = (e) => {
//       if (isTransitioning) return;

//       e.preventDefault();

//       clearTimeout(scrollTimeout);
//       scrollTimeout = setTimeout(() => {
//         if (e.deltaY > 0 && currentPage < pages.length - 1) {
//           // Scroll down - page comes from bottom
//           setDirection("down");
//           setIsTransitioning(true);
//           setCurrentPage((prev) => prev + 1);
//           setTimeout(() => setIsTransitioning(false), 1000);
//         } else if (e.deltaY < 0 && currentPage > 0) {
//           // Scroll up - page comes from top
//           setDirection("up");
//           setIsTransitioning(true);
//           setCurrentPage((prev) => prev - 1);
//           setTimeout(() => setIsTransitioning(false), 1000);
//         }
//       }, 50);
//     };

//     const handleTouchStart = (e) => {
//       touchStart = e.touches[0].clientY;
//     };

//     const handleTouchEnd = (e) => {
//       if (isTransitioning) return;

//       const touchEnd = e.changedTouches[0].clientY;
//       const diff = touchStart - touchEnd;

//       if (Math.abs(diff) > 50) {
//         if (diff > 0 && currentPage < pages.length - 1) {
//           // Swipe up - page comes from bottom
//           setDirection("down");
//           setIsTransitioning(true);
//           setCurrentPage((prev) => prev + 1);
//           setTimeout(() => setIsTransitioning(false), 1000);
//         } else if (diff < 0 && currentPage > 0) {
//           // Swipe down - page comes from top
//           setDirection("up");
//           setIsTransitioning(true);
//           setCurrentPage((prev) => prev - 1);
//           setTimeout(() => setIsTransitioning(false), 1000);
//         }
//       }
//     };

//     const handleKeyDown = (e) => {
//       if (isTransitioning) return;

//       if (
//         (e.key === "ArrowDown" || e.key === "PageDown") &&
//         currentPage < pages.length - 1
//       ) {
//         setDirection("down");
//         setIsTransitioning(true);
//         setCurrentPage((prev) => prev + 1);
//         setTimeout(() => setIsTransitioning(false), 1000);
//       } else if (
//         (e.key === "ArrowUp" || e.key === "PageUp") &&
//         currentPage > 0
//       ) {
//         setDirection("up");
//         setIsTransitioning(true);
//         setCurrentPage((prev) => prev - 1);
//         setTimeout(() => setIsTransitioning(false), 1000);
//       }
//     };

//     const container = containerRef.current;
//     if (container) {
//       container.addEventListener("wheel", handleWheel, { passive: false });
//       container.addEventListener("touchstart", handleTouchStart);
//       container.addEventListener("touchend", handleTouchEnd);
//       window.addEventListener("keydown", handleKeyDown);
//     }

//     return () => {
//       if (container) {
//         container.removeEventListener("wheel", handleWheel);
//         container.removeEventListener("touchstart", handleTouchStart);
//         container.removeEventListener("touchend", handleTouchEnd);
//       }
//       window.removeEventListener("keydown", handleKeyDown);
//       clearTimeout(scrollTimeout);
//     };
//   }, [currentPage, pages.length, isTransitioning]);

//   const pageVariants = {
//     enter: (direction) => ({
//       y: direction === "down" ? "100%" : "-100%",
//       opacity: 0,
//     }),
//     center: {
//       y: 0,
//       opacity: 1,
//     },
//     exit: (direction) => ({
//       y: direction === "down" ? "-100%" : "100%",
//       opacity: 0,
//     }),
//   };

//   return (
//     <div
//       ref={containerRef}
//       className="fixed inset-0 w-full h-full overflow-hidden bg-black"
//     >
//       <Navbar />
//       <AnimatePresence initial={false} custom={direction} mode="wait">
//         <motion.div
//           key={currentPage}
//           custom={direction}
//           variants={pageVariants}
//           initial="enter"
//           animate="center"
//           exit="exit"
//           transition={{
//             y: { type: "spring", stiffness: 300, damping: 30, duration: 0.8 },
//             opacity: { duration: 0.5 },
//           }}
//           className="absolute inset-0 w-full h-full"
//         >
//           {pages[currentPage]}
//         </motion.div>
//       </AnimatePresence>

//       {/* Page Indicators */}
//       <div className="fixed right-8 top-1/2 -translate-y-1/2 z-50 flex flex-col gap-3">
//         {pages.map((_, index) => (
//           <button
//             key={index}
//             onClick={() => {
//               if (!isTransitioning && index !== currentPage) {
//                 setDirection(index > currentPage ? "down" : "up");
//                 setIsTransitioning(true);
//                 setCurrentPage(index);
//                 setTimeout(() => setIsTransitioning(false), 1000);
//               }
//             }}
//             className={`w-3 h-3 rounded-full transition-all ${
//               index === currentPage
// ? "bg-white scale-125"
//                 : "bg-white/40 hover:bg-white/60"
//             }`}
//             aria-label={`Go to page ${index + 1}`}
//           />
//         ))}
//       </div>

//       {/* Page Counter */}
//       <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 text-white text-sm">
//         <span className="text-2xl font-bold">{currentPage + 1}</span>
//         <span className="text-white/60"> / {pages.length}</span>
//       </div>
//     </div>
//   );
