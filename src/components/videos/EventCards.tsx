import { motion } from 'framer-motion';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
type EventCardProps = {
  title: string;
  startDate: string;
  endDate: string;
  description: string;
  image: string;
  delay?: number;
  eventID:string;
};

const EventCard = ({ title, startDate, endDate, description, image, delay = 0 ,eventID}: EventCardProps) => {
    const router = useRouter();
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ delay: delay }}
      viewport={{ once: true }}
      className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow border-2 border-orange-600 hover:border-orange-600"
    >
      <div className="relative aspect-video">
        <Image
          src={image}
          alt={title}
          fill
          className="object-cover"
        />
      </div>

      <div className="p-6">
        <div className="flex items-center mb-2">
          <svg className="w-5 h-5 text-gray-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <span className="text-sm font-medium text-gray-500">
            {new Date(startDate).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })} –{' '}
            {new Date(endDate).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </span>

        </div>
        <h3 className="text-xl font-bold text-orange-600 mb-3">{title}</h3>
        <p className="text-gray-600">{description.length > 80 ? description.slice(0, 80) + '...' : description}</p>

        <button className="mt-4 inline-flex items-center text-orange-600 hover:text-orange-400 font-medium"   onClick={() => router.push(`/events/${eventID}`)}>
          View
          <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
          </svg>
        </button>
      </div>
    </motion.div>
  );
};

export default EventCard;