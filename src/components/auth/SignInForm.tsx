"use client";
import Input from "@/components/form/input/InputField";
import OTPInput from "@/components/form/input/OTPInput";
import Label from "@/components/form/Label";
import Button from "@/components/ui/button/Button";
import { ChevronLeftIcon } from "@/icons";
import Link from "next/link";
import React, { useState, useEffect } from "react";
import { toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from "next/navigation";
import Image from "next/image";
import Header from '@/components/home/Header';
import { useTheme } from '@/context/ThemeContext';
export default function SignInForm() {
    const { theme } = useTheme();
  const router = useRouter();
  const { login } = useAuth();
  const [mobileNumber, setMobileNumber] = useState("");
  const [otp, setOtp] = useState("");
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [timer, setTimer] = useState(0);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (timer > 0) {
      interval = setInterval(() => {
        setTimer((prevTimer) => prevTimer - 1);
      }, 1000);
    }
    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [timer]);

  const handleSendOtp = async (e?: React.FormEvent) => {
    if (e) {
      e.preventDefault();
    }
    if (!mobileNumber || mobileNumber.length !== 10) {
      setError('Please enter a valid 10-digit mobile number');
      toast.error('Please enter a valid 10-digit mobile number');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/v1/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phone: mobileNumber
        }),
        credentials: 'include'
      });

      const data = await response.json();

      if (data.success) {
        setIsOtpSent(true);
        setError(null);
        setTimer(60); // Start 60 seconds timer
        toast.success('OTP sent successfully!');
      } else {
        setError(data.message || 'Failed to send OTP. Please try again.');
        toast.error('Failed to send OTP. Please try again.');
      }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to send OTP. Please try again.';
      setError(message);
      console.error('Login error:', error);
      toast.error(message);
    }
    finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!otp || otp.length !== 4) {
      setError('Please enter a valid 4-digit OTP');
      toast.error('Please enter a valid 4-digit OTP');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/v1/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phone: mobileNumber,
          otp: otp,
        }),
        credentials: 'include',
      });

      const data = await response.json();
      
      if (!response.ok) {
        // throw new Error(data.message || 'Failed to verify OTP');
      }
      if (data.success) {
        // Use auth context to handle login and redirect
        login(data.user, 'user');
        localStorage.setItem('userToken', data.token || '');
        toast.success('Login successful!');
        router.push('/user/dashboard');
      } else {
        setError(data.message || 'Invalid OTP. Please try again.');
        toast.error(data.message || 'Invalid OTP. Please try again.');
      }
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : 'Invalid OTP. Please try again.';
      setError(message);
      console.error('Verification error:', error);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };


  return (
    <>
      <Header />
      <div className="mt-4 flex items-center justify-center min-h-screen  dark:bg-gray-900 p-4 sm:p-6">
                
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col lg:flex-row w-full max-w-4xl bg-white dark:bg-gray-800 rounded-3xl shadow-2xl overflow-hidden"
      >
        {/* Left Panel: Sign In Form */}
        <div className="w-full lg:w-1/2 p-6 sm:p-10 flex flex-col justify-center">
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-6"
          >
            <Link
              href="/"
              className="inline-flex items-center text-sm text-gray-500 transition-colors hover:text-purple-600 dark:text-gray-400 dark:hover:gradient-text"
            >
              <ChevronLeftIcon />
              Back to dashboard
            </Link>
          </motion.div>
          
          <motion.h1 
            initial={{ scale: 0.95 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.3, delay: 0.2 }}
            className="mb-1.5 font-semibold text-gray-800 text-3xl sm:text-4xl lg:text-5xl dark:text-white/90"
          >
            Welcome Back
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 3 }}
            className="text-base text-gray-500 dark:text-gray-400 mb-6 sm:mb-8"
          >
            {isOtpSent ? `Enter the OTP sent to ${mobileNumber}` : "Enter your mobile number to receive OTP"}
          </motion.p>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.3 }}
          >
            <form onSubmit={isOtpSent ? handleVerifyOtp : handleSendOtp}>
              <div className="space-y-5 sm:space-y-6">
                <AnimatePresence>
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="text-sm text-red-500 dark:text-red-400 bg-red-50 dark:bg-red-900/30 p-4 rounded-xl"
                    >
                      {error}
                    </motion.div>
                  )}
                </AnimatePresence>
                {!isOtpSent ? (
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.6, duration: 0.8 }}
                  >
                    <Label>
                      Mobile Number <span className="text-red-500">*</span>
                    </Label>
                    <motion.div whileFocus={{ scale: 1.01 }}>
                      <Input
                        type="tel"
                        placeholder="Enter your mobile number"
                        defaultValue={mobileNumber}
                        onChange={(e) => setMobileNumber(e.target.value)}
                        pattern="[0-9]{10}"
                        title="Please enter a valid 10-digit mobile number"
                        className="mt-2"
                      />
                    </motion.div>
                  </motion.div>
                ) : (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.8, duration: 0.8 }}
                  >
                    <Label>
                      Enter OTP <span className="text-red-500">*</span>
                    </Label>
                    <div className="mt-2">
                      <motion.div
                        initial={{ scale: 0.95 }}
                        animate={{ scale: 1 }}
                        transition={{ duration: 0.8, delay: 0.9 }}
                      >
                        <OTPInput
                          length={4}
                          onChange={setOtp}
                        />
                      </motion.div>
                    </div>
                    <motion.div 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.5 }}
                      className="flex flex-col sm:flex-row sm:justify-between items-start sm:items-center mt-4 gap-3 sm:gap-0"
                    >
                      <button
                        type="button"
                        onClick={handleSendOtp}
                        disabled={timer > 0}
                        className={`text-sm transition-colors ${
                          timer > 0
                            ? "text-gray-400 cursor-not-allowed"
                            : "gradient-text hover:gradient-text dark:gradient-text dark:hover:gradient-text"
                        }`}
                      >
                        Resend OTP {timer > 0 && `(${timer}s)`}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setIsOtpSent(false);
                          setOtp("");
                          setError(null);
                        }}
                        className="text-sm text-gray-500 hover:gradient-text dark:text-gray-400 dark:hover:gradient-text transition-colors"
                      >
                        Change Mobile Number
                      </button>
                    </motion.div>
                  </motion.div>
                )}
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="mt-6"
                >
                  <Button
                    disabled={loading}
                    className="w-full gradient-bg hover:gradient-bg text-white rounded-xl py-3 transition-all duration-300 shadow-lg hover:shadow-xl"
                    variant="primary"
                  >
                    {loading ? (
                      <div className="flex items-center justify-center">
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                        {isOtpSent ? 'Verifying...' : 'Sending OTP...'}
                      </div>
                    ) : (
                      isOtpSent ? 'Verify OTP' : 'Send OTP'
                    )}
                  </Button>
                </motion.div>
              </div>
            </form>
          </motion.div>
        </div>
        
        {/* Right Panel: Welcome/Illustration Section */}
        <div className="hidden lg:flex w-1/2 p-6 sm:p-10 gradient-bg from-purple-500 gradient-bg dark:gradient-bg dark:gradient-bg text-white flex-col items-center justify-center text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            {/* You can replace this with an actual illustration */}
           <Image
                           src={theme === "dark" ? "/images/logo/wincoe-logo.png" : "/images/logo/wincoe-logo.png"}
                           alt="WIN CoE"
                           width={200}
                           height={200}
                            className="mb-6 opacity-90 ml-16"
                         />
                          {/* <Image
              src="/images/brand/brand-01.svg" // Placeholder image, replace with your own
              alt="Welcome Illustration"
              width={200}
              height={200}
              className="mb-6 opacity-90 ml-16"
            /> */}
            <h2 className="font-bold text-3xl sm:text-4xl mb-4 leading-tight">
              Manage Your Finances with Ease!
            </h2>
            <p className="text-purple-100 text-lg mb-8 opacity-90">
              Your ultimate solution for effortless loan repayment tracking and financial peace of mind.
            </p>
            {/* <Button
              variant="primary"
              className="bg-white text-purple-600 hover:bg-purple-100 dark:bg-purple-950 dark:text-purple-300 dark:hover:bg-purple-900 transition-all duration-300 rounded-xl py-3 px-8 shadow-lg"
              onClick={() => router.push('/about')} // Example link, change as needed
            >
              Learn More
            </Button> */}
          </motion.div>
        </div>
      </motion.div>
               
    </div>
    </>
    
    
  );
}