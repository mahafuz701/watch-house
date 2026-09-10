import { env, isDev } from "../config/env";

export interface SmsMessage {
  to: string;
  text: string;
}

/**
 * SMS abstraction — swap providers (Twilio, GreenWeb, etc.) behind this interface.
 * In development and without credentials it logs to the console.
 */
export async function sendSms(msg: SmsMessage): Promise<void> {
  if (env.SMS_PROVIDER === "none" || env.SMS_PROVIDER === "log") {
    if (isDev) console.log(`[sms:dev] To: ${msg.to} | ${msg.text}`);
    return;
  }
  const provider = env.SMS_PROVIDER;
  if (provider === "twilio") {
    // Example binding — replace with your Twilio SDK call:
    // const twilio = require("twilio")(env.TWILIO_ACCOUNT_SID, env.TWILIO_AUTH_TOKEN);
    // await twilio.messages.create({ from: env.TWILIO_FROM_NUMBER, to: msg.to, body: msg.text });
    console.log("[sms:twilio] configured but not wired in this sandbox.");
  } else {
    console.warn(`[sms] unknown provider "${provider}", message skipped.`);
  }
}