import Image from 'next/image';
import { useState, useEffect, useRef } from 'react';
import { ScratchCard } from 'next-scratchcard';
import { toast } from 'react-hot-toast';
import confetti from 'canvas-confetti';
import { motion, AnimatePresence } from 'framer-motion';

interface ScratchCardAmount {
  $numberDecimal: string;
}

interface ScratchCard {
  _id: string;
  phone: string;
  coupon_code: string;
  amount: ScratchCardAmount;
  validity: number;
  isActive: number;
  scratched: number;
  redeemed: number;
  createdAt: string;
  updatedAt: string;
}

export default function ScratchCards() {
  const [loadingCards, setLoadingCards] = useState<Record<string, boolean>>({});
  const [cards, setCards] = useState<ScratchCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [showCelebration, setShowCelebration] = useState(false);
  const [scratchedCardId, setScratchedCardId] = useState<string | null>(null);
  const hasFetched = useRef(false);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [cardDimensions, setCardDimensions] = useState<{ width: number, height: number }[]>([]);
  const [loadingProgress, setLoadingProgress] = useState<Record<string, number>>({});

  useEffect(() => {
    const updateDimensions = () => {
      setCardDimensions(
        cardRefs.current.map(ref => {
          if (!ref) return { width: 340, height: 220 }; // Default fallback
          const width = ref.clientWidth - 32; // Subtract padding
          const height = (width * 220) / 340; // Maintain 340:220 aspect ratio
          return { width, height };
        })
      );
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, [cards.length]); // Re-run on cards length change

  const fetchCards = async () => {
    try {
      const response = await fetch('/api/v1/scratch-cards', {
        credentials: 'include',
      });
      const data = await response.json();
      if (data.success) {
        setCards(data.data);
      }
    } catch (error) {
      console.error('Error fetching scratch cards:', error);
    } finally {
      setLoading(false);
      hasFetched.current = true;
    }
  };

  useEffect(() => {
    if (hasFetched.current) return;
    fetchCards();
  }, []);

  const handleRedeem = async (cardId: string) => {
    console.log('Redeeming card:', cardId);
    window.open('https://WIN CoE.rewardzpromo.com/', '_blank');
  };

  const handleCopyCode = async (code: string) => {
    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(code);
      } else {
        const textarea = document.createElement('textarea');
        textarea.value = code;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
      }
      setCopiedCode(code);
      toast.success('Coupon code copied!');
      setTimeout(() => setCopiedCode(null), 3000);
    } catch (err) {
      console.error('Failed to copy code:', err);
      toast.error('Failed to copy code');
    }
  };

  const triggerCelebration = () => {
    // Confetti animation
    confetti({
      particleCount: 150,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#FFD700', '#FFA500', '#FF6347', '#FF69B4', '#9370DB']
    });

    // Coin burst animation
    setTimeout(() => {
      confetti({
        particleCount: 30,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: ['#FFD700']
      });
      confetti({
        particleCount: 30,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: ['#FFD700']
      });
    }, 250);

    setShowCelebration(true);
    setTimeout(() => setShowCelebration(false), 3000);
  };


  const handleScratchComplete = async (cardId: string) => {
    setLoadingCards(prev => ({ ...prev, [cardId]: true }));

    // Start progress timer
    // Start progress timer
    let progress = 0;
    const interval = setInterval(() => {
      progress += 5;
      if (progress >= 100) clearInterval(interval);
    }, 250); // 250ms * 20 = 5000ms (5 seconds)
    try {
      // Simulate 5 second loading
      await new Promise(resolve => setTimeout(resolve, 5000));
      const response = await fetch(`/api/v1/scratch-cards/${cardId}/scratch`, {
        method: 'POST',
        credentials: 'include',
      });

      const data = await response.json();
      if (data.success) {
        setScratchedCardId(cardId);
        triggerCelebration();
        fetchCards();
      }
    } catch (err) {
      console.error('Failed to mark card scratched:', err);
    } finally {
      clearInterval(interval);
      setLoadingCards(prev => ({ ...prev, [cardId]: false }));
      setLoadingProgress(prev => ({ ...prev, [cardId]: 0 }));
      console.log(loadingProgress)
    }
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
        {[1, 2, 3].map(i => (
          <div key={i} className="animate-pulse bg-gray-200 dark:bg-gray-700 rounded-lg h-48"></div>
        ))}
      </div>
    );
  }


  return (
    <div className="p-4 relative z-0">
      <style>{`
        @keyframes borderPulse {
          0% { border-color: transparent; }
          50% { border-color: #9333ea; }
          100% { border-color: transparent; }
        }
        .hover-animate {
          transition: transform 0.5s ease-in-out, border-color 0.1s;
        }
        .hover-animate:hover {
          transform: scale(0.9);
          animation: borderPulse 2s infinite;
          border-width: 2px;
          border-color: #9333ea;
        }
        @keyframes float {
          0% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(5deg); }
          100% { transform: translateY(0px) rotate(0deg); }
        }
        .floating-coin {
          animation: float 3s ease-in-out infinite;
        }
      `}</style>

      <h2 className="text-2xl font-semibold mb-6 text-gray-800 dark:text-gray-200">Your Rewards</h2>

      <AnimatePresence>
        {showCelebration && (
          <>
            {/* Add this backdrop div for blur effect */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 backdrop-blur-sm bg-black/30"
            />

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 500 }}
                className="text-4xl font-bold text-yellow-400"
              >
                <>
                  🎉 Congratulations! 🎉
                  <br></br>
                  You get a scratch card worth
                  <p className='text-center'> ₹{parseFloat(cards.find(card => card._id === scratchedCardId)?.amount.$numberDecimal || '0').toFixed(2)}!</p>

                </>

              </motion.div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {cards.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {cards.map((card, index) => (
            <div
              key={card._id}
              ref={el => { cardRefs.current[index] = el; }}
              className="relative rounded-xl border shadow-sm bg-white dark:bg-gray-800 overflow-hidden hover-animate w-full"
            >
              {loadingCards[card._id] ? (
                <div className="h-full w-full flex items-center justify-center min-h-[220px] bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div
                    role="status"
                    aria-label="Loading"
                    className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-500"
                  ></div>
                </div>
              ) : card.scratched === 0 ? (
                <div className="p-4 relative z-10 w-full">
                  {cardDimensions[index] && (
                    <ScratchCard
                      key={`${card._id}-${cardDimensions[index].width}`}
                      width={cardDimensions[index].width}
                      height={cardDimensions[index].height}
                      image="/images/scratch-cover-full.svg"
                      finishPercent={65}
                      brushSize={50}
                      onComplete={() => handleScratchComplete(card._id)}
                    >
                      <div className="flex flex-col items-center justify-center h-full bg-gradient-to-r from-brand-100 to-brand-50 dark:from-brand-900 dark:to-brand-800">
                        <div className="text-[clamp(1.5rem,5vw,2.25rem)] font-bold text-brand-600 dark:text-brand-400 mb-2">
                          ₹{parseFloat(card.amount.$numberDecimal).toFixed(2)}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          Scratch to reveal your reward!
                        </div>
                      </div>
                    </ScratchCard>
                  )}
                </div>
              ) : (
                <motion.div
                  className="p-6"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5 }}
                >
                  <div className="flex flex-col items-center space-y-4">
                    <motion.div
                      className="text-3xl font-bold text-brand-600 dark:text-brand-400"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.2 }}
                    >
                      ₹{parseFloat(card.amount.$numberDecimal).toFixed(2)}
                    </motion.div>
                    <motion.span
                      className={`px-3 py-1 rounded-full text-xs font-semibold tracking-wide ${card.redeemed === 1
                        ? 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100'
                        : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-100'
                        }`}
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.3 }}
                    >
                      {card.redeemed === 1 ? 'Redeemed' : 'Ready to Redeem'}
                    </motion.span>
                    {card.redeemed === 0 && (
                      <motion.button
                        onClick={() => handleRedeem(card._id)}
                        className="flex items-center space-x-1 px-4 py-2 bg-brand-500 hover:bg-brand-600 text-white rounded-lg text-sm font-medium transition-colors"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.4 }}
                      >
                        <span>Redeem Now</span>
                      </motion.button>
                    )}
                  </div>
                  <motion.div
                    className="mt-4 text-center text-sm text-gray-600 dark:text-gray-400"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                  >
                    <div className="flex items-center justify-center space-x-2">
                      <span>Code: </span>
                      <div className="relative flex items-center">
                        <span className="font-mono text-gray-800 dark:text-gray-100">
                          {card.coupon_code}
                        </span>
                        <button
                          onClick={() => handleCopyCode(card.coupon_code)}
                          className="ml-2 p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                        >
                          {copiedCode === card.coupon_code ? '✅' : '📋'}
                        </button>
                      </div>
                    </div>
                    <div>Valid for {card.validity} days</div>
                    <div className="mt-1 text-xs text-gray-400 dark:text-gray-500">
                      Created: {new Date(card.createdAt).toLocaleDateString()}
                    </div>
                  </motion.div>
                </motion.div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-10 text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
          <div className="mb-4">
            <Image
              src="/images/empty-rewards.svg"
              alt="No Rewards"
              width={120}
              height={120}
              className="mx-auto"
            />
          </div>
          <p className="text-lg font-medium">No scratch cards yet</p>
          <p className="text-sm mt-2">
            Start participating in rewards to earn scratch cards!
          </p>
        </div>
      )}
    </div>
  );

}
