# Events Reservation System

This repository contains a full-stack web application for managing event reservations. The system allows users to view available events and make reservations.

## Features
- **User Authentication:** Secure login and session management.
- **Event Management:** Admin dashboard for event management.
- **QR Code Generation:** Generate QR codes for reservation confirmations.
- **Email Notifications:** Send reservation confirmations via email.
- **Calendar Integration:** View events in a calendar view.
- **Rate Limiting and Security:** Protect the API with rate limiting and security best practices.

## Technologies Used

### Backend
- **Node.js**: v20.12.2
- **Express**: v4.19.2
- **PostgreSQL**: Database integration using `pg`
- **TypeScript**: v5.4.5
- **Session Management**: `express-session` and `connect-pg-simple`
- **Rate Limiting**: `express-rate-limit`
- **Email Service**: `postmark`
- **QR Code Generation**: `qrcode`
- **Security**: `helmet`, `cors`

### Frontend
- **React**: v18.2.0
- **Vite**: v5.2.0 for bundling and development
- **Material UI**: v5.15.17 for UI components
- **FullCalendar**: v6.1.11 for calendar integration
- **Date-fns**: v3.6.0 for date manipulation
- **TypeScript**: v5.2.2
- **Emotion**: For CSS-in-JS styling