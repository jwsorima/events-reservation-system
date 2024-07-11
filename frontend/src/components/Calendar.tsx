import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import { EventReserve } from '../pages/ReserveEvent';
import { EventCreate } from '../pages/admin/CreateEvent';
import RenderEventContent from './RenderEventContent';

interface CalendarReserveProps {
  events: EventReserve[];
};

interface CalendarCreateProps {
  events: EventCreate[];
}

type CalendarProps = CalendarReserveProps | CalendarCreateProps;

export default function CalendarReserve(props: CalendarProps) {
  const {
    events
  } = props;

  return <>
    <FullCalendar
      aspectRatio={1.65}
      height={514}
      plugins={[dayGridPlugin]}
      initialView="dayGridMonth"
      headerToolbar={{
        start: 'today prev,next',
        center: 'title',
        end: ''
      }}
      buttonText={{
        today: 'Today'
      }}
      events={events.map(event => ({
        title: event.event_name,
        start: event.start_datetime,
        end: event.end_datetime,
        extendedProps: {
          location: event.location,
          slots: event.slots_left,
          color: event.color
        },
      }))}
      eventContent={RenderEventContent}
      slotMinTime="00:00:00"
      slotMaxTime="24:00:00"
      displayEventEnd={true}
      eventDisplay="block"
      locale="en-US"
      eventTimeFormat={{ hour: 'numeric', minute: '2-digit', meridiem: 'short' }}
      dayMaxEventRows={1}
      moreLinkContent={(args) => `+${args.num} more`}
      eventOrder="start,-duration,allDay,title"
      eventOverlap={false}
    />
  </>
}