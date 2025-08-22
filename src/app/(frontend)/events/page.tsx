'use client';

import useSWR from 'swr';
import PastEvents from './pastEvent';
import UpcomingEvent from './upcomming';
import OngoingEvent from './ongoing';
import EventCard from '@/components/videos/EventCards';
import SkeletonCard from '@/components/skelton/skelton'
const fetcher = (url: string) => fetch(url).then(res => res.json());


export default function EventsSegrigation({ customLimit = 0 }: { customLimit?: number }) {
  const { data, error, isLoading } = useSWR(`${process.env.NEXT_PUBLIC_API_URL}/events/list?customLimit=${customLimit}&from=frontend`, fetcher);

  if (isLoading) {
    return (
      <div className="space-y-24">
        <div className="space-y-10">
          <h2 className="text-3xl font-bold text-center text-orange-600">Ongoing Events</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 3 }).map((_, i) => (
              <SkeletonCard key={`ongoing-${i}`} />
            ))}
          </div>
        </div>

        <div className="space-y-10">
          <h2 className="text-3xl font-bold text-center text-orange-600">Upcoming Events</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 3 }).map((_, i) => (
              <SkeletonCard key={`upcoming-${i}`} />
            ))}
          </div>
        </div>

        <div className="space-y-10">
          <h2 className="text-3xl font-bold text-center text-orange-600">Past Events</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 3 }).map((_, i) => (
              <SkeletonCard key={`past-${i}`} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) return <p className="p-6 text-red-600">Failed to load events</p>;

  const events = data?.data?.events || [];

  const now = new Date();

  const categorizeEvent = (event: any) => {
    const start = new Date(event.startDate);
    const end = new Date(event.endDate);

    if (now < start) return 'upcoming';
    if (now > end) return 'past';
    return 'ongoing';
  };

  const upcoming = events.filter(e => categorizeEvent(e) === 'upcoming');
  const past = events.filter(e => categorizeEvent(e) === 'past');
  const ongoing = events.filter(e => categorizeEvent(e) === 'ongoing');

  return (
    <div className="space-y-24">
      {/* Ongoing Events */}

      {ongoing.length > 0 && (
        <div className="space-y-10">
          <h2 className="text-3xl font-bold text-center text-orange-600 ">Ongoing Events</h2>
          {ongoing.map((event, i) => (
            <OngoingEvent
              key={event._id}
              title={event.title}
              startDate={event.startDate}
              endDate={event.endDate}
              description={event.description}
              image={event.images[0]?.url}
              delay={i * 0.1}
              eventID={event._id}
            />
          ))}
        </div>
      )}

      {/* Upcoming Events */}
      {upcoming.length > 0 && (
        <div className="space-y-10">
          <h2 className="text-3xl font-bold text-center text-orange-600 ">Upcoming Events</h2>
          {upcoming.map((event, i) => (
            <UpcomingEvent
              key={event._id}
              title={event.title}
              startDate={event.startDate}
              endDate={event.endDate}
              description={event.description}
              image={event.images[0]?.url||"/images/gallery/default.jpg"}
              delay={i * 0.1}
              eventID={event._id}
            />
          ))}
        </div>
      )}

      {/* Past Events */}
      {past.length > 0 && (
        <PastEvents
          events={past.map(e => ({
            title: e.title,
            description: e.description,
            startDate: e.startDate,
            endDate: e.endDate,
            image: e.images[0]?.url,
            eventID: e._id
          }))}
        />
      )}
    </div>
  );
}
