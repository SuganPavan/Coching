/**
 * SMS helper using Fast2SMS (https://fast2sms.com)
 *
 * Setup:
 *   1. Sign up at https://fast2sms.com (free trial credits included)
 *   2. Go to Dev API section and copy your API key
 *   3. Add to .env.local:
 *        FAST2SMS_API_KEY=your_api_key_here
 *        NEXT_PUBLIC_ACADEMY_NAME=Bright Future Academy
 *
 * Fast2SMS "Quick SMS" (DLT-free) is used here, which works for
 * transactional messages without requiring DLT template registration.
 * Upgrade to "DLT" route if you register a sender ID and template
 * with TRAI for higher deliverability.
 */

const FAST2SMS_URL = "https://www.fast2sms.com/dev/bulkV2";

export interface SMSResult {
  success: boolean;
  phone: string;
  error?: string;
}

/**
 * Send an SMS to one or more Indian mobile numbers via Fast2SMS.
 *
 * @param phones  Array of 10-digit mobile numbers (without +91 or 0)
 * @param message Plain text message, max ~160 chars per segment
 */
export async function sendSMS(phones: string[], message: string): Promise<SMSResult[]> {
  const apiKey = process.env.FAST2SMS_API_KEY;
  if (!apiKey) {
    console.error("FAST2SMS_API_KEY not set in environment variables.");
    return phones.map((phone) => ({
      success: false,
      phone,
      error: "SMS service not configured (missing FAST2SMS_API_KEY)",
    }));
  }

  // Fast2SMS accepts comma-separated numbers
  const numbersStr = phones
    .map((p) => p.replace(/\D/g, "").slice(-10)) // strip country code/spaces/dashes
    .filter((p) => p.length === 10)
    .join(",");

  if (!numbersStr) {
    return phones.map((phone) => ({
      success: false,
      phone,
      error: "Invalid phone number format",
    }));
  }

  try {
    const res = await fetch(FAST2SMS_URL, {
      method: "POST",
      headers: {
        authorization: apiKey,
        "Content-Type": "application/json",
        "cache-control": "no-cache",
      },
      body: JSON.stringify({
        route: "q",        // "q" = Quick SMS (no DLT template needed)
        message,
        language: "english",
        flash: 0,
        numbers: numbersStr,
      }),
    });

    const data = await res.json();

    if (data.return === true) {
      return phones.map((phone) => ({ success: true, phone }));
    }

    const errorMsg = data.message?.[0] || "Unknown Fast2SMS error";
    console.error("Fast2SMS error:", data);
    return phones.map((phone) => ({ success: false, phone, error: errorMsg }));
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : "Network error sending SMS";
    console.error("Fast2SMS request failed:", errorMsg);
    return phones.map((phone) => ({ success: false, phone, error: errorMsg }));
  }
}

/**
 * Build the standard absent-notification message for a student.
 * Kept under 160 chars to stay within a single SMS segment.
 */
export function buildAbsentMessage(params: {
  studentName: string;
  studentClass: string;
  date: Date;
  academyName: string;
}): string {
  const { studentName, studentClass, date, academyName } = params;
  const dateStr = date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: "Asia/Kolkata",
  });
  return (
    `Dear Parent, ${studentName} (${studentClass}) was marked ABSENT on ${dateStr}. ` +
    `If this is an error, please contact ${academyName}.`
  );
}
