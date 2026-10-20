// Phone numbers are kept as 10 digits without the leading 0 / +92, e.g. "3001234567".

/** "3001234567" -> "300 1234567" */
export const formatPhone = (digits: string) =>
  digits.length > 3 ? `${digits.slice(0, 3)} ${digits.slice(3)}` : digits;

/** "3001234567" -> "+92 300 •••4567" */
export const maskPhone = (digits: string) => `+92 ${digits.slice(0, 3)} •••${digits.slice(-4)}`;

/** Pakistani mobile numbers: 10 digits starting with 3. */
export const isValidPhone = (digits: string) => digits.length === 10 && digits.startsWith("3");
