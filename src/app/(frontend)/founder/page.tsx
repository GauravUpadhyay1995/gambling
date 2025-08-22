'use client';

import { motion } from 'framer-motion';
import { useTheme } from '@/context/ThemeContext'; // Adjust the import path as per your project

export default function Founder() {
    const { theme } = useTheme(); // Assuming you're using a ThemeContext
//     const newsContent = `From Wikipedia, the free encyclopedia
// Romesh T. Wadhwani
// Born	August 1947 (age 77)[1]
// Karachi, British India
// Citizenship	United States
// Alma mater	IIT Bombay
// Carnegie Mellon University
// Known for	Internet companies, philanthropy
// Spouse	Kathleen "Kathy" Wadhwani
// Children	1 daughter
// Relatives	Sunil Wadhwani (brother)
// Romesh T. Wadhwani (born 1947) is an Indian-American billionaire,[2] businessman and head of investment firm SAIGroup.[3] He is the former chairman and CEO of Symphony Technology Group, a private equity firm for software, Internet and technology services companies. He established the Wadhwani Foundation for economic development in emerging economies, with an initial focus on India.

// Early life
// Romesh T. Wadhwani was born in a Sindhi Hindu family in Karachi, Pakistan, 10 days after India and Pakistan gained Independence from Britain in August 1947.[1][4] His family moved to India following Indian independence. He contracted polio at age 2 and had difficulty getting admission to school.[5] He received a bachelor's degree from the IIT Bombay, and master's and PhD degrees in electrical engineering from Carnegie Mellon University.[6]

// Career
// For a decade, Wadhwani was the founder, chairman, and CEO of two companies, one (American Robot Corporation) specializing in software and solutions for computer-integrated manufacturing and the other (Compu-Guard Corporation) in technology-enabled energy management.[7]

// Wadhwani was then the founder, chairman, and CEO of Aspect Development, Inc., from its startup in 1991 to its acquisition in 1999 by i2 Technologies for $9.3 billion in stock.[6]

// Together with his brother, Sunil Wadhwani, he has founded Wadhwani Institute for Artificial Intelligence in Mumbai to develop artificial intelligence solutions for public good.[8]

// Wadhwani has invested $1 billion in predictive and generative AI SaaS company SymphonyAI.[9]

// Philanthropy
// Wadhwani is on the board of trustees of the John F. Kennedy Center for the Performing Arts and the Center for Strategic and International Studies, both in Washington, D.C.[10]

// He established the Wadhwani Foundation for economic development in emerging economies in 2000,[1] with an initial focus on India. Initiatives in India include the National Entrepreneurship Network, which has established programs to enable growth-centric entrepreneurship at over 500 universities and colleges; a skills college network to help train and place large numbers of young adults in vocational jobs; an opportunities network for the disabled; and a research initiative in biosciences and biotechnology to help create jobs through innovation.[1] The Foundation has launched a US-India policy initiative, with Rick Inderfurth, previously Assistant Secretary of State, as the Wadhwani Chair at the Center for Strategic and International Studies, a policy think tank in Washington, D.C., and Hemant Singh, former Indian Ambassador to Japan, as the head of the Wadhwani program at ICRIER, a major policy institute in Delhi. Wadhwani won the India Abroad Award for Lifetime Achievement in 2013.

// In 2012, Wadhwani inaugurated a new research centre at the National Centre for Biological Sciences (NCBS) in Bangalore, named after his late mother, Shanta Wadhwani.[11]

// Personal life
// He is married to Kathleen "Kathy" Wadhwani,[11][12] and they live in Palo Alto, California.[6]

// They have one daughter, Melina, who married Patrick Carey in 2011.[13][14]

// Honours
// Wadhwani was awarded an honorary doctorate by the IIT Bombay in 2018.[15]

// References
//  Tripathi, Naandika (29 April 2022). "Romesh Wadhwani: Building Up, And Giving Away". Forbes India. Retrieved 6 May 2024.
//  Rajvanshi, Astha (7 September 2023). "TIME100 AI 2023: Romesh and Sunil Wadhwani". Time. Retrieved 20 May 2024.
//  Fannin, Rebecca (8 December 2023). "How a 75-year-old Indian-American tech entrepreneur is betting $1 billion of his own fortune on AI's future". CNBC. Retrieved 20 May 2024.
//  Gupta, Ashish (5 June 2015). "How to create jobs by the million". Fortune India. Archived from the original on 30 March 2018. Retrieved 7 May 2020. The white-haired, soft-spoken Sindhi was born in Karachi, and later moved to India with his parents.
//  Krishna, Mrinalini. "Q&A With Immigrant Billionaire Romesh Wadhwani: America Needs Immigrants". Forbes.
//  "Forbes profile: Romesh T. Wadhwani". Forbes. Retrieved 20 November 2019.
//  Cuff, Daniel F.; Times, Special To the New York (13 June 1985). "ROBOT MAKER FINDS A NICHE (Published 1985)". The New York Times. ISSN 0362-4331. Retrieved 22 January 2021.
//  Christopher, Nilesh (20 February 2018). "India's first AI research institute opened in Mumbai". The Economic Times. Retrieved 16 January 2020.
//  Fannin, Rebecca (8 December 2023). "How a 75-year-old Indian-American tech entrepreneur is betting $1 billion of his own fortune on AI's future". CNBC. CNBC. Retrieved 15 July 2024.
//  "Romesh Wadhwani". www.csis.org. Retrieved 20 May 2025.
//  "Romesh Wadhwani: The Renaissance Man - Forbes India". Forbes India. Retrieved 22 February 2018.
//  "Wadhwani". glasspockets.org. Retrieved 22 February 2018.
//  "2011-08-31 Wadhwani - Carey Family Party - Singularity University". singularityu.org. Archived from the original on 22 February 2018. Retrieved 22 February 2018.
//  "Oceanfront Ceremony & Opulent Pink and Metallic Reception". insideweddings.com. Retrieved 22 February 2018.
//  ANI (11 August 2018). "Romesh Wadhwani conferred with degree of Doctor of Science by IIT Bombay". Business Standard India. Retrieved 16 January 2020.`;

    return (
        <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            className={`max-w-4xl mx-auto px-4 sm:px-6 py-12 ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}
        >
            <motion.img
                src="/images/founder/founder.png"
                alt="Founder"
                className="w-full h-auto object-cover rounded-lg mb-8 shadow-md"
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.4 }}
            />
            {/* <motion.div
                className="prose dark:prose-invert max-w-none"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                dangerouslySetInnerHTML={{ __html: newsContent }}
            /> */}
        </motion.div>
    );
}
