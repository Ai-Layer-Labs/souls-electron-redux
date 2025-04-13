import React from 'react';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import format from 'date-fns/format';
import parse from 'date-fns/parse';
import startOfWeek from 'date-fns/startOfWeek';
import getDay from 'date-fns/getDay';
import 'react-big-calendar/lib/css/react-big-calendar.css';

const locales = {
  'en-US': require('date-fns/locale/en-US')
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

interface CalendarEvent {
  title: string;
  startTime: string;
  endTime: string;
  location?: string;
  calendar?: string;
  id?: string;
}

interface CalendarViewProps {
  events: CalendarEvent[];
}

export const CalendarView: React.FC<CalendarViewProps> = ({ events }) => {
  // Convert our event format to react-big-calendar format
  const calendarEvents = events.map(event => ({
    title: event.title,
    start: new Date(event.startTime),
    end: new Date(event.endTime),
    location: event.location,
    calendar: event.calendar,
    id: event.id
  }));

  return (
    <div style={{ height: '100%', padding: '20px' }}>
      <Calendar
        localizer={localizer}
        events={calendarEvents}
        startAccessor="start"
        endAccessor="end"
        style={{ height: '100%' }}
        defaultView="month"
        views={['month', 'week', 'day']}
        eventPropGetter={(event) => {
          // Customize event appearance based on calendar
          const backgroundColor = event.calendar === 'Formula 1' ? '#e10600' : '#3174ad';
          return {
            style: {
              backgroundColor,
              borderRadius: '4px',
              opacity: 0.8,
              color: 'white',
              border: '0px',
              display: 'block'
            }
          };
        }}
        components={{
          event: ({ event }) => (
            <div>
              <strong>{event.title}</strong>
              {event.location && <div>{event.location}</div>}
            </div>
          )
        }}
      />
    </div>
  );
}; 