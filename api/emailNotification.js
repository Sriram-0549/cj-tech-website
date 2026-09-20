import { Resend } from 'resend';

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

export function buildNotificationEmailHtml(inquiry) {
  const safeName = escapeHtml(inquiry.name);
  const safeCompany = escapeHtml(inquiry.company) || 'Not specified';
  const safeEmail = escapeHtml(inquiry.email);
  const safePhone = escapeHtml(inquiry.phone) || 'Not provided';
  const safeService = escapeHtml(inquiry.service);
  const safeBudget = escapeHtml(inquiry.budget) || 'Not sure yet';
  const safeMessage = escapeHtml(inquiry.message);

  const dateObj = inquiry.created_at ? new Date(inquiry.created_at) : new Date();
  const formattedDate = dateObj.toUTCString();

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>New CJ Tech Project Enquiry</title>
</head>
<body style="margin:0;padding:24px;background-color:#07090e;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#f1f5f9;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:600px;margin:0 auto;background:#0f172a;border-radius:12px;border:1px solid #1e293b;overflow:hidden;box-shadow:0 10px 30px rgba(0,0,0,0.5);">
    <tr>
      <td style="padding:24px 32px;background:linear-gradient(135deg,#0b0f17 0%,#111827 100%);border-bottom:1px solid #1f293d;">
        <span style="font-size:20px;font-weight:800;letter-spacing:0.1em;color:#00f0ff;text-transform:uppercase;">CJ TECH</span>
        <span style="font-size:13px;color:#94a3b8;margin-left:8px;font-weight:500;">| System Lead Dispatch</span>
        <h1 style="margin:8px 0 0;font-size:22px;font-weight:700;color:#ffffff;">🔔 New Project Enquiry</h1>
      </td>
    </tr>
    <tr>
      <td style="padding:32px;">
        <p style="margin:0 0 20px;font-size:14px;color:#94a3b8;line-height:1.5;">
          A new client submitted an enquiry through the CJ Tech contact portal. The lead has been recorded in Supabase.
        </p>
        <table width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse;margin-bottom:24px;background:#0b1120;border-radius:8px;border:1px solid #1e293b;">
          <tr>
            <td style="padding:12px 16px;border-bottom:1px solid #1e293b;width:35%;color:#64748b;font-size:13px;font-weight:600;text-transform:uppercase;">Customer Name</td>
            <td style="padding:12px 16px;border-bottom:1px solid #1e293b;color:#f8fafc;font-size:14px;font-weight:600;">${safeName}</td>
          </tr>
          <tr>
            <td style="padding:12px 16px;border-bottom:1px solid #1e293b;color:#64748b;font-size:13px;font-weight:600;text-transform:uppercase;">Company</td>
            <td style="padding:12px 16px;border-bottom:1px solid #1e293b;color:#cbd5e1;font-size:14px;">${safeCompany}</td>
          </tr>
          <tr>
            <td style="padding:12px 16px;border-bottom:1px solid #1e293b;color:#64748b;font-size:13px;font-weight:600;text-transform:uppercase;">Email</td>
            <td style="padding:12px 16px;border-bottom:1px solid #1e293b;color:#00f0ff;font-size:14px;">
              <a href="mailto:${encodeURI(inquiry.email)}" style="color:#00f0ff;text-decoration:none;font-weight:600;">${safeEmail}</a>
            </td>
          </tr>
          <tr>
            <td style="padding:12px 16px;border-bottom:1px solid #1e293b;color:#64748b;font-size:13px;font-weight:600;text-transform:uppercase;">Phone</td>
            <td style="padding:12px 16px;border-bottom:1px solid #1e293b;color:#cbd5e1;font-size:14px;">${safePhone}</td>
          </tr>
          <tr>
            <td style="padding:12px 16px;border-bottom:1px solid #1e293b;color:#64748b;font-size:13px;font-weight:600;text-transform:uppercase;">Requested Service</td>
            <td style="padding:12px 16px;border-bottom:1px solid #1e293b;color:#f8fafc;font-size:14px;font-weight:600;">
              <span style="display:inline-block;padding:4px 10px;background:rgba(0,240,255,0.12);border:1px solid rgba(0,240,255,0.3);border-radius:4px;color:#00f0ff;font-size:13px;">${safeService}</span>
            </td>
          </tr>
          <tr>
            <td style="padding:12px 16px;border-bottom:1px solid #1e293b;color:#64748b;font-size:13px;font-weight:600;text-transform:uppercase;">Budget</td>
            <td style="padding:12px 16px;border-bottom:1px solid #1e293b;color:#34d399;font-size:14px;font-weight:600;">${safeBudget}</td>
          </tr>
          <tr>
            <td style="padding:12px 16px;color:#64748b;font-size:13px;font-weight:600;text-transform:uppercase;">Submission Date/Time</td>
            <td style="padding:12px 16px;color:#94a3b8;font-size:13px;">${formattedDate}</td>
          </tr>
        </table>
        <div style="margin-bottom:24px;">
          <div style="font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:0.05em;color:#64748b;margin-bottom:8px;">Message:</div>
          <div style="padding:16px;background:#07090e;border-left:3px solid #00f0ff;border-radius:4px;color:#e2e8f0;font-size:14px;line-height:1.6;white-space:pre-wrap;">${safeMessage}</div>
        </div>
        <table width="100%" cellspacing="0" cellpadding="0">
          <tr>
            <td align="center" style="padding-top:12px;">
              <a href="mailto:${encodeURI(inquiry.email)}?subject=Re:%20CJ%20Tech%20Project%20Enquiry%20-%20${encodeURIComponent(inquiry.name)}" style="display:inline-block;padding:12px 28px;background:#00f0ff;color:#07090e;font-size:14px;font-weight:700;text-decoration:none;border-radius:6px;text-transform:uppercase;letter-spacing:0.05em;">
                Reply Directly to ${safeName} &rarr;
              </a>
            </td>
          </tr>
        </table>
      </td>
    </tr>
    <tr>
      <td style="padding:20px 32px;background:#07090e;border-top:1px solid #1e293b;text-align:center;">
        <p style="margin:0;font-size:12px;color:#475569;">
          CJ Tech Lead Engine • Synced to Supabase <code style="color:#94a3b8;">public.project_inquiries</code>
        </p>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export function buildNotificationEmailText(inquiry) {
  const dateObj = inquiry.created_at ? new Date(inquiry.created_at) : new Date();
  return `🔔 New CJ Tech Project Enquiry

Customer: ${inquiry.name}
Company: ${inquiry.company || 'Not specified'}
Email: ${inquiry.email}
Phone: ${inquiry.phone || 'Not provided'}
Service: ${inquiry.service}
Budget: ${inquiry.budget || 'Not sure yet'}
Submission Date/Time: ${dateObj.toUTCString()}

Message:
${inquiry.message}

---
Lead synced to Supabase public.project_inquiries
`;
}

export async function sendResendNotification({ inquiryRecord, apiKey, recipientEmail, fromEmail }) {
  if (!apiKey) {
    console.warn('[Resend] Notification skipped: RESEND_API_KEY is not configured in .env');
    return { success: false, skipped: true, reason: 'RESEND_API_KEY missing' };
  }

  if (!recipientEmail) {
    console.warn('[Resend] Notification skipped: NOTIFICATION_EMAIL is not configured in .env');
    return { success: false, skipped: true, reason: 'NOTIFICATION_EMAIL missing' };
  }

  try {
    const resend = new Resend(apiKey);
    const fromAddress = fromEmail || 'CJ Tech <onboarding@resend.dev>';
    const subject = '🔔 New CJ Tech Project Enquiry';
    const html = buildNotificationEmailHtml(inquiryRecord);
    const text = buildNotificationEmailText(inquiryRecord);

    const { data, error } = await resend.emails.send({
      from: fromAddress,
      to: [recipientEmail],
      replyTo: inquiryRecord.email,
      subject,
      html,
      text
    });

    if (error) {
      console.error('[Resend] Delivery returned error:', error);
      return { success: false, error };
    }

    console.info('[Resend] Notification email sent successfully. ID:', data?.id);
    return { success: true, id: data?.id };
  } catch (err) {
    console.error('[Resend] Dispatch error:', err?.message || err);
    return { success: false, error: err?.message || err };
  }
}
