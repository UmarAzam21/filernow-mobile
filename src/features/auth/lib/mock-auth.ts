// Frontend-only stand-ins until the FastAPI endpoints are connected.
// TODO: replace with real calls (POST /auth/start, /auth/register, /auth/login).

// Demo account: 300 1234567 with PIN 2580 goes through the login flow.
const accounts = new Map<string, string>([["3001234567", "2580"]]);

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export async function checkPhone(phone: string) {
  await wait(600);
  return { exists: accounts.has(phone) };
}

export async function createAccount(phone: string, pin: string) {
  await wait(800);
  accounts.set(phone, pin);
}

export async function verifyPin(phone: string, pin: string) {
  await wait(700);
  return accounts.get(phone) === pin;
}
