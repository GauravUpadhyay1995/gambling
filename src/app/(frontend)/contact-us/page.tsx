"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import Joi from 'joi';
import { joiResolver } from '@hookform/resolvers/joi';
import { FiSend, FiUser, FiMail, FiPhone, FiMessageSquare } from 'react-icons/fi';
import { FaCheckCircle } from 'react-icons/fa';

// Joi validation schema and type definitions remain the same...
// Joi validation schema
const formSchema = Joi.object({
    firstName: Joi.string().required().messages({
        'string.empty': 'First name is required',
        'any.required': 'First name is required'
    }),
    lastName: Joi.string().required().messages({
        'string.empty': 'Last name is required',
        'any.required': 'Last name is required'
    }),
    email: Joi.string().email({ tlds: { allow: false } }).required().messages({
        'string.email': 'Please enter a valid email',
        'string.empty': 'Email is required',
        'any.required': 'Email is required'
    }),
    phone: Joi.string().optional().allow(''),
    comments: Joi.string()
        .min(10)
        .max(600)
        .required()
        .messages({
            'string.min': 'Message must be at least 10 characters',
            'string.max': 'Message cannot exceed 600 characters',
            'string.empty': 'Message is required',
            'any.required': 'Message is required'
        })
});

type FormData = {
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    comments: string;
};

const ContactUs = () => {
    // All state and form logic remains the same...
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const {
        register,
        handleSubmit,
        reset,
        watch,
        formState: { errors }
    } = useForm<FormData>({
        resolver: joiResolver(formSchema)
    });

    const onSubmit = async (data: FormData) => {
        setIsLoading(true);
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1500));
        console.log("Form submitted:", data);
        setIsLoading(false);
        setIsSubmitted(true);
        reset();

        // Reset submission status after 5 seconds
        setTimeout(() => setIsSubmitted(false), 5000);
    };

    // Animation variants
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1,
                delayChildren: 0.2
            }
        }
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: {
            y: 0,
            opacity: 1,
            transition: {
                duration: 0.5,
                ease: "easeOut"
            }
        }
    };

    const successVariants = {
        hidden: { scale: 0.8, opacity: 0 },
        visible: {
            scale: 1,
            opacity: 1,
            transition: {
                type: "spring",
                stiffness: 400,
                damping: 25
            }
        },
        exit: {
            scale: 0.8,
            opacity: 0,
            transition: {
                duration: 0.2
            }
        }
    };
    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-4 sm:py-8 px-4 sm:px-6 lg:px-8  sm:gap-8">
            {/* Image Column - Hidden on mobile, shown on lg screens and up */}
            <motion.div
                initial="hidden"
                animate="visible"
                variants={containerVariants}
                className="hidden lg:flex max-w-2xl w-full h-full"
            >
                <motion.div
                    variants={itemVariants}
                    className="relative w-full h-full min-h-[300px] rounded-xl overflow-hidden "
                >
                    <motion.img
                        src="/images/girl-with-laptop-light.svg"
                        alt="Contact Us"
                        className="w-full h-full object-cover"
                    // initial={{ scale: 1 }}
                    // whileHover={{ scale: 1.05, transition: { duration: 0.5 } }}
                    />
                </motion.div>
            </motion.div>

            {/* Form Column - Full width on mobile, right-aligned on desktop */}
            <motion.div
                initial="hidden"
                animate="visible"
                variants={containerVariants}
                className="w-full max-w-2xl mx-auto lg:mr-0 bg-white rounded-xl shadow-md overflow-hidden"
            >
                {/* Rest of your form component remains exactly the same */}
                <div className="bg-gradient-to-r from-orange-600 to-orange-300 p-6 text-white">
                    <motion.h1
                        variants={itemVariants}
                        className="text-3xl font-bold"
                    >
                        Contact Us
                    </motion.h1>
                    <motion.p
                        variants={itemVariants}
                        className="mt-2 text-indigo-100"
                    >
                        Have questions? We'd love to hear from you.
                    </motion.p>
                </div>

                <AnimatePresence>
                    {isSubmitted ? (
                        <motion.div
                            key="success"
                            variants={successVariants}
                            initial="hidden"
                            animate="visible"
                            exit="exit"
                            className="p-8 text-center"
                        >
                            <FaCheckCircle className="mx-auto text-green-500 text-5xl mb-4" />
                            <h2 className="text-2xl font-bold text-gray-800 mb-2">Thank You!</h2>
                            <p className="text-gray-600">
                                Your message has been sent successfully. We'll get back to you soon.
                            </p>
                        </motion.div>
                    ) : (
                        <motion.form
                            key="form"
                            variants={containerVariants}
                            initial="hidden"
                            animate="visible"
                            onSubmit={handleSubmit(onSubmit)}
                            className="p-6 space-y-6"
                        >
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <motion.div variants={itemVariants}>
                                    <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
                                        First Name *
                                    </label>
                                    <div className="mt-1 relative rounded-md shadow-sm">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <FiUser className="h-5 w-5 text-gray-400" />
                                        </div>
                                        <input
                                            id="firstName"
                                            type="text"
                                            {...register("firstName")}
                                            className={`block w-full pl-10 pr-3 py-2 border ${errors.firstName ? 'border-red-300' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500`}
                                            placeholder="John"
                                        />
                                    </div>
                                    {errors.firstName && (
                                        <p className="mt-1 text-sm text-red-600">{errors.firstName.message}</p>
                                    )}
                                </motion.div>

                                <motion.div variants={itemVariants}>
                                    <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">
                                        Last Name *
                                    </label>
                                    <div className="mt-1 relative rounded-md shadow-sm">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <FiUser className="h-5 w-5 text-gray-400" />
                                        </div>
                                        <input
                                            id="lastName"
                                            type="text"
                                            {...register("lastName")}
                                            className={`block w-full pl-10 pr-3 py-2 border ${errors.lastName ? 'border-red-300' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500`}
                                            placeholder="Doe"
                                        />
                                    </div>
                                    {errors.lastName && (
                                        <p className="mt-1 text-sm text-red-600">{errors.lastName.message}</p>
                                    )}
                                </motion.div>
                            </div>

                            <motion.div variants={itemVariants}>
                                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                                    Email *
                                </label>
                                <div className="mt-1 relative rounded-md shadow-sm">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <FiMail className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <input
                                        id="email"
                                        type="email"
                                        {...register("email")}
                                        className={`block w-full pl-10 pr-3 py-2 border ${errors.email ? 'border-red-300' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500`}
                                        placeholder="you@example.com"
                                    />
                                </div>
                                {errors.email && (
                                    <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
                                )}
                            </motion.div>

                            <motion.div variants={itemVariants}>
                                <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                                    Phone Number
                                </label>
                                <div className="mt-1 relative rounded-md shadow-sm">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <FiPhone className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <input
                                        id="phone"
                                        type="tel"
                                        {...register("phone")}
                                        className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                                        placeholder="(123) 456-7890"
                                    />
                                </div>
                            </motion.div>

                            <motion.div variants={itemVariants}>
                                <label htmlFor="comments" className="block text-sm font-medium text-gray-700">
                                    Message *
                                </label>
                                <div className="mt-1 relative rounded-md shadow-sm">
                                    <div className="absolute inset-y-0 left-0 pl-3 pt-3 flex items-start pointer-events-none">
                                        <FiMessageSquare className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <textarea
                                        id="comments"
                                        rows={4}
                                        {...register("comments")}
                                        className={`block w-full pl-10 pr-3 py-2 border ${errors.comments ? 'border-red-300' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500`}
                                        placeholder="Your message (max 600 characters)"
                                    />
                                </div>
                                {errors.comments && (
                                    <p className="mt-1 text-sm text-red-600">{errors.comments.message}</p>
                                )}
                                <p className="mt-1 text-xs text-gray-500 text-right">
                                    {watch("comments")?.length || 0}/600 characters
                                </p>
                            </motion.div>

                            <motion.div variants={itemVariants}>
                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-orange-600 hover:bg-orange-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200"
                                >
                                    {isLoading ? (
                                        <>
                                            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            Sending...
                                        </>
                                    ) : (
                                        <>
                                            <FiSend className="-ml-1 mr-2 h-4 w-4" />
                                            Send Message
                                        </>
                                    )}
                                </button>
                            </motion.div>
                        </motion.form>
                    )}
                </AnimatePresence>
            </motion.div>
        </div>
    );
};

export default ContactUs;