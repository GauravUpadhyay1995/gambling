"use client";

import Image from "next/image";
import { motion } from "framer-motion";

const fadeIn = {
  hidden: { opacity: 0, y: 40 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.2 },
  }),
};
const hoverEffect = {
  scale: 1.05,
  y: -2,
  transition: {
    type: "spring",
    stiffness: 300,
    damping: 12,
  },
};
const listContainer = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.2, // Delay between each list item
    },
  },
};

const listItem = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
};
 const points = [
    "Academic & Industry experts (Outside IIT Delhi)",
    "Faculty members from IIT Delhi",
    "Nominated members from Wadhwani Foundation",
    "Intellectual Property Advisor, FITT",
  ];

const people = {
  leadership: [
    { name: "Prof. Neetu Singh", role: "Project Coordinator", img: "/images/teams/team-8.jpg" },
    { name: "Prof. Amit Mehndiratta", role: "", img: "/images/steering-committee/amit.jpg" },
    { name: "Dr. Shirshendu Mukherjee", role: "", img: "/images/steering-committee/Shirshendu-Mukherjee.png" },
    { name: "Prof. Biswarup Mukherjee", role: "", img: "/images/steering-committee/Biswarup.png" },
    { name: "Prof. Tapan K. Gandhi", role: "", img: "/images/steering-committee/Tapan.png" },
    { name: "Prof. Supreet Singh Bagga", role: "", img: "/images/steering-committee/Supreet.png" },
    { name: "Prof. Ashok Kumar Patel", role: "", img: "/images/steering-committee/Ashok.png" },
  ],
  operations: [
    { name: "Dr. Ankushi Bansal", role: "Principal PI, Scientist", img: "/images/steering-committee/Ankushi.jpg" },
    { name: "Ms. Neha Burman", role: "Senior Project Manager", img: "/images/steering-committee/Neha.jpg" },
  ],
};

const SteeringCommittee = () => {
  return (
    <section className=" py-12 px-4 text-center">
      {/* Leadership and Steering Committee */}
      <motion.div initial="hidden" whileInView="visible" className="mb-12">

        <div className="flex flex-wrap justify-center gap-8">
          {people.leadership.map((person, i) => (
            <motion.div
              key={i}
              custom={i}
              variants={fadeIn}
              className="w-32"
              whileHover={{
                scale: 1.1,
                y: -5,
                transition: {
                  type: "spring",
                  stiffness: 300,
                  damping: 10,
                },
              }}
            >
              <div className="w-24 h-24 mx-auto mb-2 overflow-hidden rounded-full border-2 hover:border-1 border-orange-600 hover:border-orange-600">
                <Image
                  src={person.img}
                  alt={person.name}
                  width={100}
                  height={100}
                  className="object-cover w-full h-full"
                />
              </div>
              <p className="text-sm font-semibold">{person.name}</p>
              <p className="text-xs text-orange-500">{person.role}</p>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Scientific Advisory Committee */}
      <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-12"
        >
          <h2 className="text-orange-600 text-4xl font-semibold mb-4">
            Scientific Advisory Committee
          </h2>
    
          <motion.ul
            initial="hidden"
            whileInView="visible"
            variants={{
              visible: {
                transition: {
                  staggerChildren: 0.2,
                },
              },
            }}
            className="text-sm leading-relaxed max-w-lg mx-auto space-y-3"
          >
            {points.map((text, idx) => (
              <motion.li
                key={idx}
                variants={listItem}
                whileHover={hoverEffect}
                className="flex items-start gap-2"
              >
                <svg
                  className="w-5 h-5 mt-1 text-orange-600 shrink-0"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                <span>{text}</span>
              </motion.li>
            ))}
          </motion.ul>
        </motion.div>

      {/* Operations Team */}
      <motion.div initial="hidden" whileInView="visible" className="mx-auto mt-10">
        <h2 className="text-orange-600 text-4xl font-semibold mb-6">Operations Team</h2>
        <div className="flex flex-wrap justify-center gap-10">
          {people.operations.map((person, i) => (
            <motion.div
              key={i}
              custom={i}
              variants={fadeIn}
              className="w-32"
              whileHover={{
                scale: 1.1,
                y: -5,
                transition: {
                  type: "spring",
                  stiffness: 300,
                  damping: 10,
                },
              }}
            >
              <div className="w-24 h-24 mx-auto mb-2 overflow-hidden rounded-full border-2 hover:border-1 border-orange-600 hover:border-orange-600">
                <Image
                  src={person.img}
                  alt={person.name}
                  width={100}
                  height={100}
                  className="object-cover w-full h-full"
                />
              </div>
              <p className="text-sm font-semibold">{person.name}</p>
              <p className="text-xs text-gray-500">{person.role}</p>
            </motion.div>
          ))}
        </div>
      </motion.div>
  

<motion.div
  initial="hidden"
  whileInView="visible"
  variants={listContainer}
  className="text-sm leading-relaxed max-w-2xl mx-auto mt-10"
>
  <h2 className="text-orange-600 text-4xl font-semibold mb-4">
    Core Objectives and Mission
  </h2>

  <motion.ul className="space-y-3 text-left">
    {[
      "Translation of patient-specific research, products and technologies.",
      "Capacity building to impart advanced training and improve employability through cutting-edge research projects.",
      "Collaborate focusing on clinical and technical spokes with an emphasis on personalized healthcare.",
    ].map((text, index) => (
      <motion.li
        key={index}
        variants={listItem}
        whileHover={hoverEffect}
        className="flex items-start gap-2"
      >
        <svg
          className="w-5 h-5 mt-1 text-orange-600 shrink-0"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M5 13l4 4L19 7"
          />
        </svg>
        <span>{text}</span>
      </motion.li>
    ))}
  </motion.ul>
</motion.div>

    </section>
  );
};

export default SteeringCommittee;
