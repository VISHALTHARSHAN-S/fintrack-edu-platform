/**
 * Email Service Abstraction Layer
 * Handles OTP and password reset email delivery.
 * In development / mock mode, logs to console cleanly.
 */
export const sendVerificationEmail = async (email, otpCode) => {
  console.log(`\n==================================================`);
  console.log(`[EMAIL SERVICE] Sending Verification OTP`);
  console.log(`To: ${email}`);
  console.log(`Verification Code: ${otpCode}`);
  console.log(`Message: We've sent a verification code to your registered email address.`);
  console.log(`==================================================\n`);
  return true;
};

export const sendPasswordResetEmail = async (email, resetToken) => {
  console.log(`\n==================================================`);
  console.log(`[EMAIL SERVICE] Sending Password Reset Email`);
  console.log(`To: ${email}`);
  console.log(`Reset Token: ${resetToken}`);
  console.log(`==================================================\n`);
  return true;
};
