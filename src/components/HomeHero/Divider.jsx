export default function Divider({ width = 0, heightClass = "h-6" }) {
  return (
    <div
      className="pointer-events-none absolute left-0 top-1/2 -translate-y-1/2 hidden lg:block"
      style={{ width }}
    >
      <div
        className={`${heightClass} w-full bg-black/80 mix-blend-multiply`}
        style={{
          // fade alpha to 0 at the right edge (works in Safari/Chrome/Edge/Firefox)
          WebkitMaskImage:
            "linear-gradient(to right, black 85%, transparent 100%)",
          maskImage: "linear-gradient(to right, black 85%, transparent 100%)",
          WebkitMaskRepeat: "no-repeat",
          maskRepeat: "no-repeat",
          WebkitMaskSize: "100% 100%",
          maskSize: "100% 100%",
        }}
      />
    </div>
  );
}
