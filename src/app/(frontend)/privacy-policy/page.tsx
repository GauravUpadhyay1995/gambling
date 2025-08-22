"use client";

import { useEffect } from "react";
import Header from "@/components/home/Header";
import Footer from "@/components/home/Footer";

export default function PrivacyPolicyPage() {
  useEffect(() => {
    const style = document.createElement("style");
    style.innerHTML = `
      @keyframes borderGradient {
        0%, 100% {
          border-color: transparent;
        }
        50% {
          border-color: rgba(168, 85, 247, 0.8);
        }
      }
      .animate-borderGradient {
        animation: borderGradient 2s linear infinite;
      }
    `;
    document.head.appendChild(style);
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  const sections = [
    {
      title: "Introduction",
      content:
        "At WIN CoE, we are committed to protecting the personal data of our users, customers, and partners. This Privacy and Security Policy outlines how we collect, use, store, and safeguard your information in compliance with applicable laws.",
    },
    {
      title: "Scope",
      content:
        "This policy applies to all data collected and processed through WIN CoE's platform, including mobile apps, websites, customer support systems, and any third-party integrations.",
    },
    {
      title: "Data We Collect",
      content: "We collect the following types of data:",
      list: [
        "Personal Information: Name, mobile number, email address, postal address.",
        "Financial Information: Loan account number, outstanding amounts, repayment status.",
        "To send reminders, alerts, and offers through SMS, email, or WhatsApp.",
        "Transactional Data: Payment history, rewards claimed, coupon redemptions.",
        "Technical Data: Device information, IP address, app usage patterns, cookies.",
      ],
    },
    {
      title: "Purpose of Data Collection",
      content: "We collect and use your data for the following purposes:",
      list: [
        "To offer repayment incentives on behalf of financial institutions.",
        "To facilitate secure transactions and delivery of rewards.",
        "To send reminders, alerts, and offers through SMS, email, or WhatsApp.",
        "To verify identity and prevent fraud.",
        "To improve our platform performance and user experience.",
      ],
    },
    {
      title: "Data Sharing and Disclosure",
      content: "We do not sell your personal data. However, we may share your information:",
      list: [
        "With partnered financial institutions to validate dues and repayments.",
        "With third-party reward providers (e.g., Amazon, Flipkart) for coupon processing.",
        "With legal authorities when required by law or legal process.",
        "With technology service providers for infrastructure, hosting, and analytics.",
        "All partners and vendors are contractually bound to comply with data protection standards.",
      ],
    },
    {
      title: "Data Security Measures",
      content: "We use the following methods to secure your data:",
      list: [
        "Encryption of data at rest and in transit using industry standards (e.g., AES-256, TLS).",
        "Secure access controls to ensure only authorized personnel access data.",
        "Regular audits and vulnerability assessments.",
        "Anonymization or pseudonymization of data where possible.",
        "Data backup and disaster recovery systems.",
      ],
    },
    {
      title: "User Rights",
      content: "You have the right to:",
      list: [
        "Access the personal data we hold about you.",
        "Request corrections or updates to your data.",
        "Withdraw consent for data processing (may affect service eligibility).",
        "Request deletion of your data, subject to legal obligations.",
        "To exercise your rights, contact: privacy@WIN CoE.in",
      ],
    },
    {
      title: "Data Retention",
      content:
        "We retain your data only as long as necessary for the purposes stated above or as required by applicable law.",
    },
    {
      title: "Policy Updates",
      content:
        "We may update this policy periodically. Users will be notified of major changes through email or in-app alerts.",
    },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-grow container mx-auto px-4 py-12 md:py-16">
        <div className="text-center mb-12">
          <h1 className="text-5xl mt-8 font-extrabold text-gray-900 dark:text-white">
            Privacy & Policy
          </h1>
          <div className="w-20 h-1 bg-purple-600 mx-auto mt-2" />
        </div>

        <div className="space-y-10">
          {sections.map((section, index) => (
            <section
              key={index}
              className="relative group bg-white dark:bg-gray-800 p-6 rounded-xl border border-transparent transition-all duration-300 ease-in-out shadow-md hover:scale-[1.02] overflow-hidden"
            >
              {/* Running Animated Border */}
              <div className="absolute inset-0 rounded-xl border-2 border-transparent group-hover:border-purple-500 animate-borderGradient z-0 pointer-events-none" />

              <div className="relative z-10">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  {section.title}
                </h2>
                {section.content && (
                  <p className="text-gray-700 dark:text-gray-300 mb-3 leading-relaxed">
                    {section.content}
                  </p>
                )}
                {section.list && (
                  <ul className="list-disc pl-5 space-y-1 text-gray-700 dark:text-gray-300">
                    {section.list.map((item, i) => (
                      <li key={i}>{item}</li>
                    ))}
                  </ul>
                )}
              </div>
            </section>
          ))}
        </div>
      </main>

      <Footer />
    </div>
  );
}
