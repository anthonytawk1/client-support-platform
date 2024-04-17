export function generateOTP() {
    return Math.random().toString().slice(2, 8);
  }