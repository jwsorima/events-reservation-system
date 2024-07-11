import QRCode from 'qrcode';
import { toZonedTime } from 'date-fns-tz';
import { version as uuidVersion, validate as uuidValidate } from 'uuid';

export function createReservationURL(eventID: string, reservationUUID: string): string {
  return `${process.env.FRONTEND_DOMAIN_NAME}/reserve-details?event_id=${eventID}&reservation_id=${reservationUUID}`
}
export function dateToUtc8(date: string): Date {
  if (isNaN(Date.parse(date))) {
    throw new Error("Invalid date string");
  }

  let fixedDate = new Date(date);
  fixedDate.setHours(fixedDate.getHours() + 8);
  return fixedDate;
}

export function escapeHtml(unsafe: string): string {
  return unsafe
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
}

export function formatDateToYMD(date: Date): string {
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  const day = String(date.getUTCDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export const getCurrentDateInGMT8 = () => {
  const now = new Date();
  return toZonedTime(now, 'Asia/Manila');
};

export function getLogoURL(): string {
  return 'https://placehold.co/150x150/DDDDDD/1045CC/webp?text=Logo'
}

export function isUuidV4(uuid: string): boolean {
  return uuidValidate(uuid) && uuidVersion(uuid) === 4;
}

export async function toBase64QRImage(value: string): Promise<string> {
  const generateQR = await QRCode.toDataURL(value, {type: 'image/jpeg'});
  return generateQR.split(',')[1];
}