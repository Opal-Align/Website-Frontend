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
    title: "No PhDs or MBAs Needed",
    description: "Turn on gOS » Follow the guidance » Get results",
    expandedDescription:
      "Solutions should not require extensive training and advanced degrees. gOS guides actions that yield the highest margins, regardless of experience.",

    hasImage: false,
    alignRight: false,
  },
  {
    id: 3,
    title: "From Zero to Results",
    description: "Day 1 Adoption » Day 1 Impact",
    expandedDescription:
      "With zero training and under 10 minutes using gOS, a practice recovered $1,500 in delinquent patient balances. gOS guided every action toward maximum margins. No complexity. Just results.",

    hasImage: false,
    alignRight: true,
  },
  {
    id: 4,

    title: "gOS is Interoperable Out of the Box",
    description: "Don't Switch » Don't Migrate » Just Connect.",
    expandedDescription:
      "gOS integrates with industry leading clinical and practice management systems. Keep your systems. Plug in gOS. Start gaining immediately.",

    alignRight: false,
  },
];
export default services;
