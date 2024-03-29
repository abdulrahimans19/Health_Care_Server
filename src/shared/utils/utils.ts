export function generateOTP(): string {
  const characters = '0123456789';
  let otp = '';
  for (let i = 0; i < 4; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    otp += characters.charAt(randomIndex);
  }
  return otp;
}
