import React from "react"
import ButtonBase from "@mui/material/ButtonBase";
import Tooltip, { TooltipProps, tooltipClasses } from '@mui/material/Tooltip';
import { styled } from '@mui/material/styles';
import { format } from 'date-fns';
import { toZonedTime } from 'date-fns-tz';
import { enUS } from "date-fns/locale";
import { Typography } from "@mui/material";

const HtmlTooltip = styled(({ className, ...props }: TooltipProps) => (
  <Tooltip {...props} classes={{ popper: className }} />
))(({ theme }) => ({
  [`& .${tooltipClasses.tooltip}`]: {
    backgroundColor: '#f5f5f9',
    color: 'rgba(0, 0, 0, 0.87)',
    maxWidth: 220,
    fontSize: theme.typography.pxToRem(12),
    border: '1px solid #dadde9',
    padding: '10px',
  },
}));

const RenderEventContent = (
  eventInfo: { 
    event: { 
      end: string | number | Date; 
      start: string | number | Date; 
      extendedProps: { 
        location: string; 
        color: string; 
      }; 
      title: string; 
    }; 
  }
) => {
  const isPastEvent = eventInfo.event.end <= toZonedTime(new Date(), 'Asia/Manila');
  const eventClass = isPastEvent ? 'fc-daygrid-event-past' : '';

  const startDateTime = format(eventInfo.event.start, "MMM d, yyyy, h:mm a", { locale: enUS })
  const endDateTime = format(eventInfo.event.end, "MMM d, yyyy, h:mm a", { locale: enUS })

  return (
    <HtmlTooltip
      title={
        <React.Fragment>
          <Typography variant="h6" color="#1045cc" component="div">
            {eventInfo.event.title}
          </Typography>
          <Typography variant="body2" color="textSecondary" component="div">
            <b>Location:</b> {eventInfo.event.extendedProps.location}
          </Typography>
          <Typography variant="body2" color="textSecondary" component="div">
            <b>Start:</b> {startDateTime}
          </Typography>
          <Typography variant="body2" color="textSecondary" component="div">
            <b>End:</b> {endDateTime}
          </Typography>
        </React.Fragment>
      }
      enterTouchDelay={0}
      leaveTouchDelay={500}
    >
      <ButtonBase
        className={`fc-daygrid-event ${eventClass}`}
        style={{
          padding: '4px 8px',
          borderRadius: '4px',
          backgroundColor: eventInfo.event.extendedProps.color,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'start',
          width: '100%',
          textAlign: 'left',
          fontSize: '1em',
          height: 'auto',
          boxSizing: 'border-box',
        }}
      >
        <strong style={{ color: '#334155' }}>
          {eventInfo.event.title}
        </strong>
      </ButtonBase>
    </HtmlTooltip>
  );
};

export default RenderEventContent;