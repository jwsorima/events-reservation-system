import { version as uuidVersion, validate as uuidValidate } from 'uuid';

export function escapeHtml(unsafe: string): string {
  return unsafe
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
}

export const formatName = (str: string): string => {
  return str.replace(/(?:^|\s)\S/g, (match) => match.toUpperCase());
};

export function isUuidV4(uuid: string): boolean {
  return uuidValidate(uuid) && uuidVersion(uuid) === 4;
}