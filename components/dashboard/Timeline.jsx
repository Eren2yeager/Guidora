'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ClockIcon, AcademicCapIcon, CurrencyDollarIcon, DocumentTextIcon, CalendarIcon } from '@heroicons/react/24/outline';
import { Card, Badge } from '@/components/ui';
import { fadeInUp } from '@/lib/animations';
import { calculateDeadlineUrgency, sortTimelineEvents } from '@/lib/utils';

const eventTypeConfig = {
  admission: {
    icon: AcademicCapIcon,
    color: 'blue',
    label: 'Admission'
  },
  scholarship: {
    icon: CurrencyDollarIcon,
    color: 'green',
    label: 'Scholarship'
  },
  exam: {
    icon: DocumentTextIcon,
    color: 'purple',
    label: 'Exam'
  },
  counselling: {
    icon: CalendarIcon,
    color: 'amber',
    label: 'Counselling'
  },
  other: {
    icon: ClockIcon,
    color: 'gray',
    label: 'Event'
  }
};

export default function Timeline({ limit = null, showUpcomingOnly = true }) {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await fetch('/api/timeline-events');
        if (res.ok) {
          const data = await res.json();
          let eventList = data.events || [];
          
          // Filter to upcoming events if requested
          if (showUpcomingOnly) {
            const now = new Date();
            eventList = eventList.filter(event => {
              const eventDate = new Date(event.endDate || event.startDate);
              return eventDate >= now;
            });
          }
          
          // Sort events by date
          eventList = sortTimelineEvents(eventList);
          
          // Limit if specified
          if (limit) {
            eventList = eventList.slice(0, limit);
          }
          
          setEvents(eventList);
        }
      } catch (error) {
        console.error('Error fetching timeline events:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, [limit, showUpcomingOnly]);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  const getUrgencyBadge = (event) => {
    const deadline = new Date(event.endDate || event.startDate);
    const urgency = calculateDeadlineUrgency(deadline);
    
    if (urgency === 'urgent') {
      return <Badge variant="danger">🔥 Urgent</Badge>;
    } else if (urgency === 'soon') {
      return <Badge variant="warning">⚠️ Soon</Badge>;
    }
    return null;
  };

  if (loading) {
    return (
      <Card variant="default" padding="lg">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 rounded w-1/4"></div>
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </Card>
    );
  }

  if (events.length === 0) {
    return (
      <Card variant="default" padding="lg" className="text-center">
        <ClockIcon className="h-12 w-12 text-gray-400 mx-auto mb-3" />
        <p className="text-gray-600">No upcoming events</p>
        <p className="text-sm text-gray-500 mt-1">Check back later for important dates</p>
      </Card>
    );
  }

  return (
    <Card variant="default" padding="lg">
      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
        <ClockIcon className="h-5 w-5 text-blue-600" />
        Upcoming Events
      </h3>
      
      <div className="space-y-4">
        {events.map((event, index) => {
          const config = eventTypeConfig[event.type] || eventTypeConfig.other;
          const Icon = config.icon;
          const startDate = new Date(event.startDate);
          const endDate = event.endDate ? new Date(event.endDate) : null;
          
          return (
            <motion.div
              key={event._id || index}
              variants={fadeInUp}
              initial="initial"
              animate="animate"
              transition={{ delay: index * 0.1 }}
              className="flex gap-4 p-4 rounded-lg border border-gray-200 hover:border-blue-300 hover:shadow-sm transition-all"
            >
              {/* Icon */}
              <div className={`shrink-0 w-10 h-10 rounded-full bg-${config.color}-100 flex items-center justify-center`}>
                <Icon className={`h-5 w-5 text-${config.color}-600`} />
              </div>
              
              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2 mb-1">
                  <h4 className="font-medium text-gray-900 line-clamp-1">{event.title}</h4>
                  {getUrgencyBadge(event)}
                </div>
                
                {event.description && (
                  <p className="text-sm text-gray-600 line-clamp-2 mb-2">{event.description}</p>
                )}
                
                <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500">
                  <Badge variant="secondary">{config.label}</Badge>
                  
                  {endDate ? (
                    <span className="flex items-center gap-1">
                      <CalendarIcon className="h-3 w-3" />
                      {formatDate(event.startDate)} - {formatDate(event.endDate)}
                    </span>
                  ) : (
                    <span className="flex items-center gap-1">
                      <CalendarIcon className="h-3 w-3" />
                      {formatDate(event.startDate)}
                    </span>
                  )}
                  
                  {event.related?.state && (
                    <span>📍 {event.related.state}</span>
                  )}
                </div>
                
                {event.link && (
                  <a
                    href={event.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-blue-600 hover:text-blue-800 mt-2 inline-flex items-center gap-1"
                  >
                    View details
                    <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </a>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
      
      {limit && events.length >= limit && (
        <div className="mt-4 text-center">
          <a href="/timeline" className="text-sm text-blue-600 hover:text-blue-800 font-medium">
            View all events →
          </a>
        </div>
      )}
    </Card>
  );
}
