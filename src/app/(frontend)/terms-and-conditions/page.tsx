"use client";

import { useEffect } from "react";
import Header from "@/components/home/Header";
import Footer from "@/components/home/Footer";

export default function TermsAndConditionsPage() {
   useEffect(() => {
  const style = document.createElement("style");
  style.innerHTML = `
    @keyframes borderGradient {
      0%, 100% { border-color: transparent; }
      50% { border-color: rgba(168, 85, 247, 0.8); }
    }
    .animate-borderGradient {
      animation: borderGradient 2s linear infinite;
    }
  `;
  document.head.appendChild(style);

  // ✅ Return a cleanup function, not the style itself
  return () => {
    document.head.removeChild(style);
  };
}, []);


    const sections = [
        {
            title: "Introduction",
            content: `Welcome to WIN CoE, a reward-based debt collection platform that empowers users to help recover pending debts and earn incentives in return. By accessing or using WIN CoE’s platform, you agree to abide by the following Terms and Conditions.`,
        },
        {
            title: "Definitions",
            list: [
                "“Platform” refers to WIN CoE’s mobile app, website, and related services.",
                "“User” means any individual or entity registered on the platform, including lenders, borrowers, and collection partners.",
                "“Borrower” is a user who owes a debt listed on the platform.",
                "“Lender” is a user who is owed money by a borrower.",
                "“Collection Partner” is a user who assists in recovering debts in exchange for rewards.",
                "“Reward” means any incentive or benefit provided to collection partners upon successful recovery of debts.",
            ],
        },
        {
            title: "Eligibility",
            content: "To use WIN CoE, you must:",
            list: [
                "Be at least 18 years old.",
                "Be capable of entering into legally binding agreements.",
                "Provide accurate and truthful registration information.",
            ],
        },
        {
            title: "Platform Use",
            content: "WIN CoE offers a platform where:",
            list: [
                "Lenders can list unpaid debts.",
                "Collection Partners can voluntarily assist in debt recovery.",
                "Borrowers may repay debts and receive possible incentives or benefits.",
            ],
        },
        {
            title: "User Conduct",
            content: "Users agree to:",
            list: [
                "Use the platform lawfully and respectfully.",
                "Not harass or threaten any individual.",
                "Not misrepresent identities or provide false information.",
                "Follow all local, state, and national laws regarding debt collection.",
            ],
        },
        {
            title: "Debt Collection Guidelines",
            list: [
                "Collection partners must act ethically and legally at all times.",
                "Aggressive, threatening, or unlawful methods are strictly prohibited.",
                "Any violation may result in immediate account suspension or legal action.",
            ],
        },
        {
            title: "Rewards System",
            list: [
                "Collection partners may receive rewards for successful recoveries, subject to verification by WIN CoE.",
                "Rewards can be in the form of cash, gift cards, vouchers, or platform credits.",
                "Reward policies are subject to change without prior notice.",
            ],
        },
        {
            title: "Privacy & Data Usage",
            list: [
                "Your personal data will be handled in accordance with our <a href='/privacy-policy' class='underline text-purple-500'>Privacy Policy</a>.",
                "We collect data to operate and improve the platform and do not sell user data to third parties.",
            ],
        },
        {
            title: "Account Suspension/Termination",
            content:
                "WIN CoE reserves the right to suspend or terminate any user account that:",
            list: [
                "Violates these terms.",
                "Participates in fraud or unethical conduct.",
                "Misuses the platform in any manner.",
            ],
        },
        {
            title: "Liability Disclaimer",
            list: [
                "WIN CoE is a facilitator, not a collection agency.",
                "We do not guarantee recovery success or reward payouts in case of dispute.",
                "We are not responsible for any user disputes, financial loss, or damages arising from use of the platform.",
            ],
        },
        {
            title: "Modifications to Terms",
            content:
                "We may update these Terms at any time. If we make changes, we will notify users through the platform or by email. Continued use of WIN CoE means you accept the updated terms.",
        },
        {
            title: "Governing Law",
            content:
                "These Terms are governed by the laws of India. All disputes shall be resolved in the courts of Delhi.",
        },
        {
            title: "Contact Us",
            content: "If you have any questions or concerns, please reach out to us at:",
            list: [
                "📧 <strong>Email</strong>: support@WIN CoE.com",
                "📍 <strong>Address</strong>: B 435, 4th Floor, Pacific Business Park, Maharaj Pur Main Road, Maharajpur, Sahibabad, Ghaziabad, Uttar Pradesh 201010",
            ],
        },
    ];

    return (
        <div className="min-h-screen flex flex-col">
            <Header />

            <main className="flex-grow container mx-auto px-4 py-12 md:py-16">
                <div className="text-center mb-12">
                    <h1 className="text-5xl mt-8 font-extrabold text-gray-900 dark:text-white">
                        Terms and Conditions
                    </h1>
                    <div className="w-20 h-1 bg-purple-600 mx-auto mt-2" />
                </div>

                <div className="space-y-10">
                    {sections.map((section, index) => (
                        <section
                            key={index}
                            className="relative group bg-white dark:bg-gray-800 p-6 rounded-xl border border-transparent transition-all duration-300 ease-in-out shadow-md hover:scale-[1.02] overflow-hidden"
                        >
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
                                            <li
                                                key={i}
                                                dangerouslySetInnerHTML={{ __html: item }}
                                            />
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
