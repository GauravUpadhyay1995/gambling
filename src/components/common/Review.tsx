"use client";

import { motion } from "framer-motion";
import { FaQuoteLeft } from "react-icons/fa";

const reviews = [
  {
    text: "Nice application, fast withdrawal service. 24 hours withdrawal available. Good admin.",
    name: "Suryamani Pandey",
    role: `${process.env.NEXT_PUBLIC_COMPANY_NAME} APP User`,
  },
  {
    text: "Best application and fast withdrawal. Easy to use app.",
    name: "Akki Lokhande",
    role: `${process.env.NEXT_PUBLIC_COMPANY_NAME} APP User`,
  },
  {
    text: "One of the best applications for earning money. Easy to use, go and download everyone. Best withdrawal service.",
    name: "Arjun",
    role: `${process.env.NEXT_PUBLIC_COMPANY_NAME} APP User`,
  },
];

export default function ReviewSection() {
  return (
    <section className="py-16 ">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <motion.h2
          className="text-3xl font-bold text-center mb-2 text-white text-center "
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          OUR {process.env.NEXT_PUBLIC_COMPANY_NAME} APP USERS REVIEW
        </motion.h2>
        <p className="text-center text-white text-center  mb-12">
          Application Users Reviews
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {reviews.map((review, index) => (
            <motion.div
              key={index}
              className="bg-gray-50 border-b-4 border-orange-500 p-6 rounded-lg shadow-md text-center"
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.15, duration: 0.5 }}
            >
              <div className="flex justify-center mb-4">
                <FaQuoteLeft className="text-orange-500 text-3xl" />
              </div>
              <p className="text-gray-800 text-sm leading-relaxed mb-4">
                {review.text}
              </p>
              <p className="text-orange-500 font-semibold">— {review.name}</p>
              <p className="text-gray-500 text-xs">{review.role}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
