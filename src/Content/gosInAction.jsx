import ScrollingWords from "../components/Info/ScrollingWords";
const services = [
  {
    id: 1,
    title: (
      <>
        Stop Managing Solutions &
        <span className="inline-block w-3 md:w-6"></span>
      </>
    ),
    secondaryTitle: "Start Gaining",
    description: (
      <span className="whitespace-nowrap text-[13px] sm:text-sm md:text-base lg:text-lg">
        One Platform » One Workflow » Zero Complexity
      </span>
    ),
    scrollingComponent: (
      <>
        <ScrollingWords
          words={["Margins", "Control", "Advantage", "Accountability"]}
        />
      </>
    ),
    expandedDescription:
      "gOS is the first guided operating system that replaces your fragmented point solutions with a simple unified interface delivering measurable gains on day one.",

    hasImage: false,
    alignRight: true,
  },
  {
    id: 2,
    title: "From Zero to Results",
    description: "Day 1 Adoption » Day 1 Impact",
    expandedDescription:
      "With zero training and under 10 minutes using gOS, a practice recovered $1,500 in delinquent patient balances. gOS guided every action toward maximum margins. No complexity. Just results.",

    hasImage: false,
    alignRight: false,
  },
  {
    id: 3,
    title: "Powering Every Provider-Led Practice",
    description: "Unified Care. Universal Impact.",
    expandedDescription:
      "gOS brings scheduling, production, and collections into one guided system — tailored for any provider-driven business. Whether it’s dental, veterinary, or ophthalmology, teams gain clarity, reduce friction, and act on what matters most. One workflow, limitless scalability.​",

    hasImage: false,
    alignRight: true,
  },
  {
    id: 4,

    title: "SEO Optimization",
    description: "Tailored SEO solutions that ",
    alignRight: false,
  },
];
export default services;
