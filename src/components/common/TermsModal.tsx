import React, { useEffect, useRef } from 'react';

interface TermsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAccept: () => void;
  content: string;
}

const TermsModal: React.FC<TermsModalProps> = ({ isOpen, onClose, onAccept, content }) => {
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    console.log(content);




    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = 'hidden';
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);
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

  // Add animation classes
  const modalClasses = `fixed inset-0 z-[9999] flex items-center justify-center transition-all duration-300 p-4 ${isOpen ? 'opacity-100 visible' : 'opacity-0 invisible'
    }`;

  const modalContentClasses = `bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-4 sm:p-6 w-full max-w-2xl max-h-[90vh]  transform transition-all duration-300 border border-gray-200 dark:border-gray-700 ${isOpen ? 'translate-y-0 opacity-100 scale-100' : 'translate-y-4 opacity-0 scale-95'
    }`;

  return (
    <div className={modalClasses}>
      <div className="fixed inset-0 bg-black/70 dark:bg-black/80 modal-backdrop transition-all duration-300" onClick={onClose}></div>
      <div ref={modalRef} className={`${modalContentClasses} modal-content`}>
        <div className="flex justify-between items-center border-b border-gray-200 dark:border-gray-700 pb-3 mb-4">
          <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">Terms & Conditions</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 focus:outline-none modal-close-button p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="p-4 text-gray-700 dark:text-gray-300 text-sm leading-relaxed whitespace-pre-wrap max-h-[50vh] sm:max-h-[60vh] overflow-y-auto">
          {/* {content} */}
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
        </div>
        <div className="mt-6 flex flex-col sm:flex-row justify-end gap-3 sm:gap-4">
          <button
            onClick={onClose}
            className="inline-flex justify-center items-center px-4 sm:px-6 py-2.5 sm:py-3 border border-gray-300 dark:border-gray-600 text-sm sm:text-base font-medium rounded-full text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl"
          >
            Cancel
          </button>
          <button
            onClick={onAccept}
            className="inline-flex justify-center items-center px-4 sm:px-6 py-2.5 sm:py-3 border border-transparent text-sm sm:text-base font-medium rounded-full text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl"
          >
            I Accept
          </button>
        </div>
      </div>
    </div>
  );
};

export default TermsModal; 