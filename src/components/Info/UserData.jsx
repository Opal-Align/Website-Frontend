// eslint-disable-next-line no-unused-vars
import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { ResponsivePie } from "@nivo/pie";
import { ResponsiveBar } from "@nivo/bar";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
  ResponsiveContainer,
} from "recharts";
const projectsData = {
  byField: [
    { name: "Branding", count: 26, color: "#000000" },
    { name: "UI/UX", count: 19, color: "#333333" },
    { name: "SMM", count: 12, color: "#666666" },
    { name: "CEO", count: 18, color: "#999999" },
  ],
  launched: [
    { year: 2020, count: 15 },
    { year: 2021, count: 25 },
    { year: 2022, count: 35 },
    { year: 2023, count: 42 },
    { year: 2024, count: 28 },
  ],
  userCases: [
    {
      logo: "LOCO",
      stat: "80+",
      description: "New leads were involved to the new site in 1st week",
    },
    {
      logo: "ipsum",
      stat: "75%",
      description: "Traffic to the new site has increased by 75%",
    },
    {
      logo: "LIMI",
      stat: "61%",
      description: "Increased user retention by first month",
    },
  ],
};

const DonutChart = () => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, amount: 0.2 });
  const data = projectsData.byField.map((item) => ({
    id: item.name,
    label: item.name,
    value: item.count,
    color: item.color,
  }));

  return (
    <motion.div
      ref={ref}
      className="h-[240px] md:h-[300px] relative"
      initial={{ opacity: 0, scale: 0.96 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 1.5, ease: "easeOut" }}
    >
      {inView && (
        <ResponsivePie
          data={data}
          margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
          key="pie-chart"
          innerRadius={0.6}
          padAngle={0.5}
          cornerRadius={3}
          colors={{ datum: "data.color" }}
          borderWidth={1}
          borderColor="white"
          enableArcLinkLabels={false}
          enableArcLabels={false}
          animate={inView}
          motionConfig="stiff"
          theme={{
            fontSize: 12,
            fontFamily: "inherit",
          }}
        />
      )}
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-4xl font-bold">75</span>
      </div>
    </motion.div>
  );
};

const ReBarChart = () => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, amount: 0.2 });
  const data = [
    { name: "Page A", uv: 590 },
    { name: "Page B", uv: 800 },
    { name: "Page C", uv: 868 },
    { name: "Page D", uv: 1397 },
    { name: "Page E", uv: 1480 },
    { name: "Page F", uv: 1520 },
    { name: "Page G", uv: 1400 },
  ];

  return (
    <div ref={ref} className="h-[240px] md:h-[300px]">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          key="bar-chart"
          data={data}
          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Bar
            dataKey="uv"
            fill="#000000"
            isAnimationActive={inView}
            animationBegin={900}
            animationDuration={900}
            animationEasing="ease-in-out"
            label={{ position: "top" }}
            radius={[8, 8, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

const PeopleIndicator = () => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, amount: 0.2 });
  return (
    <div className="space-y-4">
      <div className="flex gap-1 flex-wrap">
        {[...Array(14)].map((_, i) => (
          <motion.div
            key={i}
            className={`w-6 h-6 md:w-10 md:h-8 rounded-full ${
              i < 10 ? "bg-black" : "bg-gray-300"
            }`}
            initial={{ scale: 0 }}
            whileInView={{ scale: 1 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.2, delay: i * 0.4 }}
            isAnimationActive={inView}
          />
        ))}
      </div>
      <div className="flex gap-4 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-black" />
          <span>Involved</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-gray-300" />
          <span>Not involved</span>
        </div>
      </div>
    </div>
  );
};

const UserCases = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
      {projectsData.userCases.map((item, index) => (
        <motion.div
          key={index}
          className="space-y-6"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.5, delay: index * 0.4 }}
        >
          <div className="text-2xl font-bold">{item.logo}</div>
          <div className="text-5xl font-bold">{item.stat}</div>
          <p className="text-gray-600">{item.description}</p>
        </motion.div>
      ))}
    </div>
  );
};

export default function UserData() {
  return (
    <div className="max-w-7xl mx-auto py-20 px-4 sm:px-6 md:px-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-16 mb-20">
        <div className="space-y-6">
          <h3 className="text-xl md:text-2xl font-bold">Projects by Field</h3>
          <DonutChart />
          <div className="space-y-2">
            {projectsData.byField.map((item) => (
              <div key={item.name} className="flex justify-between">
                <span>{item.name}</span>
                <span>{item.count}</span>
              </div>
            ))}
          </div>
          <p className="text-sm text-gray-500">
            The ranking is based on the predominant domain of a project.
          </p>
        </div>

        <div className="space-y-6">
          <h3 className="text-xl md:text-2xl font-bold">Project Launched</h3>
          <ReBarChart />
          <p className="text-sm text-gray-500">
            The ranking is based on the number of projects launched per year
          </p>
        </div>

        <div className="space-y-6">
          <h3 className="text-xl md:text-2xl font-bold">
            People making a Project
          </h3>
          <PeopleIndicator />
          <p className="text-sm text-gray-500">
            Average number of people from the team involved in the project
          </p>
        </div>
      </div>

      <div className="space-y-12">
        <h2 className="text-3xl md:text-5xl lg:text-6xl font-bold">
          User cases:
        </h2>
        <UserCases />
      </div>
    </div>
  );
}
