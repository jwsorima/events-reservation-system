export const validateFieldReserveEvent = (name: string, value: string | number | Date | null) => {
  switch (name) {
    case 'name':
      if (!value) {
        return 'Name is required';
      }
      if (!/^[A-Za-zÀ-ÿ ',-.]+$/.test(value as string)) {
        return 'Invalid character(s) provided';
      }
      return '';
    case 'email':
      return /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(value as string) ? '' : 'Valid email is required';
    case 'mobile':
      if (!value) {
        return 'Mobile number is required';
      }
      if (/[A-Za-zÀ-ÿ]/.test(value as string)) {
        return 'Invalid character(s) provided';
      }
      if (/^(?!9\d{2} \d{3} \d{4}$)/.test(value as string)) {
        return 'Valid mobile number is required';
      }
      return '';
    case 'address':
      return value ? '' : 'Address is required';
    case 'selectedEvent':
      return value ? '' : 'Event selection is required';
    case 'selectedDate':
      return value ? '' : 'Date is required';
    case 'streetAddress':
      return value ? '' : 'Street Address is required';
    case 'barangay':
      return value ? '' : 'Barangay is required';
    case 'district':
      return value ? '' : 'District is required';
    case 'city':
      return value ? '' : 'City is required';
    default:
      return '';
  }
};

export const validateFieldCreateEvent = (name: string, value: string | number | Date | null) => {
  switch (name) {
    case 'name':
      return value && typeof value === 'string' ? '' : 'Name is required';
    case 'slots':
      const slotsValue = Number(value);
      if (isNaN(slotsValue)) {
        return 'Number of slots is required';
      } else if (slotsValue <= 0) {
        return 'Invalid number';
      }
      return '';
    case 'location':
      return value && typeof value === 'string' ? '' : 'Location is required';
    case 'startDate':
      return value && value instanceof Date ? '' : 'Start date is required';
    case 'endDate':
      return value && value instanceof Date ? '' : 'End date is required';
    default:
      return '';
  }
};

export const validateFieldUpdateEvent = (name: string, value: string | number | Date | null, currentSlots?: React.MutableRefObject<number | null>) => {
  const slots = currentSlots?.current ?? null;

  switch (name) {
    case 'name':
      return value && typeof value === 'string' ? '' : 'Name is required';
    case 'slots':
      if (value === null || typeof value !== 'number' || value <= 0) {
        return 'Number of slots is required';
      }
      if (slots !== null && value < slots) {
        return 'New value cannot be less than previous slots';
      }
      return '';
    case 'location':
      return value && typeof value === 'string' ? '' : 'Location is required';
    case 'startDate':
      return value && value instanceof Date ? '' : 'Start date is required';
    case 'endDate':
      return value && value instanceof Date ? '' : 'End date is required';
    default:
      return '';
  }
};