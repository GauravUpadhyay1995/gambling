'use client';

import { useParams } from 'next/navigation';
import useSWR from 'swr';
import { motion } from 'framer-motion';
import { FiCalendar, FiMapPin, FiFileText, FiArrowLeft } from 'react-icons/fi';
import Link from 'next/link';
import Carousel from '@/components/carousel/carousel';
import SkeletonCard from '@/components/skelton/skelton'

const fetcher = (url: string) => fetch(url).then(res => res.json());

export default function EventDetailsPage() {
    const { id } = useParams();
    const { data, error, isLoading } = useSWR(`${process.env.NEXT_PUBLIC_API_URL}/events/${id}`, fetcher);
    const event = data?.data;
    let IMAGE: { bgImage: string }[] =
        event?.images?.length
            ? event.images.map((img: any) => ({
                bgImage: img.url
            }))
            : [{ bgImage: "/images/gallery/default.jpg" }];

    // console.log(IMAGE)

    if (isLoading) {
        return (
            <div className="space-y-24">
                <div className="space-y-10">
                    <h2 className="text-3xl font-bold text-center text-orange-600">Events Details</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {Array.from({ length: 3 }).map((_, i) => (
                            <SkeletonCard key={`ongoing-${i}`} />
                        ))}
                    </div>
                </div>


            </div>
        );
    }
    if (error) return <p className="p-8 text-red-600">Failed to load event.</p>;


    return <>

        <Carousel images={IMAGE} />
        <motion.div
            className="max-w-5xl mx-auto px-4 py-10 space-y-8 "
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
        >

            <Link href="/events" className="text-orange-600 text-sm flex items-center mb-4 hover:underline">
                <FiArrowLeft className="mr-1" /> Back to Events
            </Link>


            <motion.h1 className="text-4xl font-bold text-center text-orange-700">
                {event.title}
            </motion.h1>

            <div className="flex items-center gap-4 text-gray-600">
                <FiCalendar />
                <span>
                    {new Date(event.startDate).toLocaleDateString('en-US', {
                        timeZone: 'UTC',
                        month: 'long',
                        day: 'numeric',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                    })}
                    –
                    {new Date(event.endDate).toLocaleDateString('en-US', {
                        timeZone: 'UTC',
                        month: 'long',
                        day: 'numeric',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                    })}
                </span>
                <FiMapPin className="ml-4" />
                <span>{event.venue}</span>
            </div>



            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.5 }}
                className=" p-6 rounded-xl "
            >
                <h3 className="flex items-center text-xl font-semibold text-orange-600 mb-3">
                    <FiFileText className="mr-2" />
                    Description
                </h3>
                <p className="text-gray-800 whitespace-pre-line leading-relaxed">
                    {event.description}
                </p>
            </motion.div>
        </motion.div>
    </>

}
