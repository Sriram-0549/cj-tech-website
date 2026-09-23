// Serverless Function Handler for POST /api/contact (e.g. Vercel, Node, Netlify)
// Uses environment variables for Supabase credentials & Resend notifications

import { sendResendNotification } from './emailNotification.js';

// In-memory sliding cache to prevent duplicate triggers from double clicks
const recentSubmissions = new Map();

function isDuplicateSubmission(email, message) {
  const now = Date.now();
  const key = `${(email || '').toLowerCase()}:${(message || '').slice(0, 50).trim()}`;
  const lastTime = recentSubmissions.get(key);

  if (lastTime && now - lastTime < 30000) {
    return true; // Duplicate detected within 30 seconds
  }

  recentSubmissions.set(key, now);

  // Periodic cleanup
  if (recentSubmissions.size > 100) {
    for (const [k, time] of recentSubmissions.entries()) {
      if (now - time > 60000) recentSubmissions.delete(k);
    }
  }

  return false;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ success: false, error: `Method ${req.method} Not Allowed` });
  }

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body || {};
    const { name, company, website, email, phone, service, budget, message } = body;

    // 1. Validation
    const trimmedName = typeof name === 'string' ? name.trim() : '';
    const trimmedEmail = typeof email === 'string' ? email.trim() : '';
    const trimmedPhone = typeof phone === 'string' ? phone.trim() : '';
    const trimmedCompany = (typeof company === 'string' && company.trim()) || (typeof website === 'string' ? website.trim() : '');
    const trimmedService = (typeof service === 'string' && service.trim()) || 'Core Accelerator (₹4,999/mo) / Free Prototype';
    const trimmedBudget = (typeof budget === 'string' && budget.trim()) || 'Flat Rate / Zero Upfront';
    const trimmedMessage = typeof message === 'string' ? message.trim() : '';
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!trimmedName || trimmedName.length < 2) {
      return res.status(400).json({ success: false, error: 'Please enter a valid name (at least 2 characters).' });
    }

    if (!trimmedEmail || !emailRegex.test(trimmedEmail)) {
      return res.status(400).json({ success: false, error: 'Please enter a valid email address.' });
    }

    if (trimmedPhone) {
      const digitsOnly = trimmedPhone.replace(/\D/g, '');
      if (digitsOnly.length < 7 || digitsOnly.length > 15) {
        return res.status(400).json({ success: false, error: 'Please enter a valid phone number (7-15 digits).' });
      }
    }

    if (!trimmedMessage || trimmedMessage.length < 3) {
      return res.status(400).json({ success: false, error: 'Please provide brief details about what your business sells or offers.' });
    }

    // 2. Prevent Double-Click / Duplicate Submissions
    if (isDuplicateSubmission(trimmedEmail, trimmedMessage)) {
      console.warn('[Contact API] Duplicate submission suppressed for:', trimmedEmail);
      return res.status(200).json({
        success: true,
        message: 'Project inquiry received successfully.'
      });
    }

    const inquiryRecord = {
      name: trimmedName,
      company: trimmedCompany,
      email: trimmedEmail,
      phone: trimmedPhone,
      service: trimmedService,
      budget: trimmedBudget,
      message: trimmedMessage,
      status: 'new',
      created_at: new Date().toISOString()
    };

    // 3. Primary Lead Storage: Supabase Database
    const supabaseUrl = process.env.SUPABASE_URL || 'https://lnauqmxaozkxrnxuiour.supabase.co';
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('[Contact API] Missing Supabase configuration.');
      return res.status(500).json({
        success: false,
        error: 'Database configuration missing. Please contact support.'
      });
    }

    let supabaseInserted = false;
    try {
      const endpoint = `${supabaseUrl.replace(/\/$/, '')}/rest/v1/project_inquiries`;
      const supaRes = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'apikey': supabaseServiceKey,
          'Authorization': `Bearer ${supabaseServiceKey}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=minimal'
        },
        body: JSON.stringify(inquiryRecord)
      });

      if (supaRes.ok) {
        supabaseInserted = true;
      } else {
        const errorText = await supaRes.text();
        console.error('[Contact API] Supabase insertion failed:', supaRes.status, errorText);
      }
    } catch (supaErr) {
      console.error('[Contact API] Supabase network error:', supaErr.message || supaErr);
    }

    // If Supabase insertion fails:
    // - Do not send notification email
    // - Return appropriate error to visitor
    if (!supabaseInserted) {
      return res.status(502).json({
        success: false,
        error: 'We were unable to record your inquiry at this moment. Please try again or reach us directly on WhatsApp at +91 93616 28990.'
      });
    }

    // 4. Secondary Notification: Resend Email
    // If Supabase succeeds but Resend fails:
    // - Do NOT fail customer response
    // - Inquiry remains safely saved in Supabase
    // - Log notification failure server-side
    const resendApiKey = process.env.RESEND_API_KEY;
    const recipientEmail = process.env.NOTIFICATION_EMAIL;
    const fromEmail = process.env.RESEND_FROM_EMAIL || 'CJ Tech <onboarding@resend.dev>';

    try {
      await sendResendNotification({
        inquiryRecord,
        apiKey: resendApiKey,
        recipientEmail,
        fromEmail
      });
    } catch (emailErr) {
      console.error('[Contact API] Email notification encountered an error:', emailErr.message || emailErr);
    }

    // 5. Successful Response to Visitor
    return res.status(200).json({
      success: true,
      message: 'Project inquiry received successfully.'
    });

  } catch (err) {
    console.error('[Contact API] Unexpected internal error:', err);
    return res.status(500).json({ success: false, error: 'Internal server error processing inquiry.' });
  }
}
