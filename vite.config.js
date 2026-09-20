import { defineConfig, loadEnv } from 'vite';
import { resolve } from 'path';
import fs from 'fs';
import { sendResendNotification } from './api/emailNotification.js';

// Helper function to read request body as JSON
function parseJsonBody(req) {
  return new Promise((resolveBody, rejectBody) => {
    let body = '';
    req.on('data', chunk => {
      body += chunk;
    });
    req.on('end', () => {
      try {
        resolveBody(body ? JSON.parse(body) : {});
      } catch (err) {
        rejectBody(err);
      }
    });
    req.on('error', rejectBody);
  });
}

// In-memory sliding cache to prevent duplicate triggers from double clicks in dev
const devSubmissions = new Map();

function isDuplicateSubmission(email, message) {
  const now = Date.now();
  const key = `${(email || '').toLowerCase()}:${(message || '').slice(0, 50).trim()}`;
  const lastTime = devSubmissions.get(key);

  if (lastTime && now - lastTime < 30000) {
    return true;
  }

  devSubmissions.set(key, now);

  if (devSubmissions.size > 100) {
    for (const [k, time] of devSubmissions.entries()) {
      if (now - time > 60000) devSubmissions.delete(k);
    }
  }

  return false;
}

// Contact API Middleware Plugin for Vite
function contactApiPlugin(env) {
  const supabaseUrl = env.SUPABASE_URL || 'https://lnauqmxaozkxrnxuiour.supabase.co';
  const supabaseServiceKey = env.SUPABASE_SERVICE_ROLE_KEY;
  const resendApiKey = env.RESEND_API_KEY;
  const recipientEmail = env.NOTIFICATION_EMAIL;
  const fromEmail = env.RESEND_FROM_EMAIL || 'CJ Tech <onboarding@resend.dev>';

  return {
    name: 'vite-plugin-contact-api',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        // Rewrite /contact and /work/velora for clean URLs in dev
        const url = req.url.split('?')[0];
        if (url === '/contact') {
          req.url = '/contact.html';
          return next();
        }
        if (url === '/work/velora' || url === '/work/velora/') {
          req.url = '/work/velora/index.html';
          return next();
        }

        // Handle POST /api/contact
        if (url === '/api/contact' && req.method === 'POST') {
          res.setHeader('Content-Type', 'application/json');

          try {
            let data;
            try {
              data = await parseJsonBody(req);
            } catch (parseErr) {
              res.statusCode = 400;
              return res.end(JSON.stringify({ success: false, error: 'Invalid JSON payload received.' }));
            }

            const { name, company, email, phone, service, budget, message } = data;

            // 1. Server-side Validation
            const trimmedName = typeof name === 'string' ? name.trim() : '';
            const trimmedEmail = typeof email === 'string' ? email.trim() : '';
            const trimmedPhone = typeof phone === 'string' ? phone.trim() : '';
            const trimmedService = typeof service === 'string' ? service.trim() : '';
            const trimmedMessage = typeof message === 'string' ? message.trim() : '';
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

            if (!trimmedName || trimmedName.length < 2) {
              res.statusCode = 400;
              return res.end(JSON.stringify({ success: false, error: 'Please provide a valid name.' }));
            }

            if (!trimmedEmail || !emailRegex.test(trimmedEmail)) {
              res.statusCode = 400;
              return res.end(JSON.stringify({ success: false, error: 'Please provide a valid email address.' }));
            }

            if (trimmedPhone) {
              const digitsOnly = trimmedPhone.replace(/\D/g, '');
              if (digitsOnly.length < 7 || digitsOnly.length > 15) {
                res.statusCode = 400;
                return res.end(JSON.stringify({ success: false, error: 'Please provide a valid phone number (7-15 digits).' }));
              }
            }

            if (!trimmedService) {
              res.statusCode = 400;
              return res.end(JSON.stringify({ success: false, error: 'Please select a service.' }));
            }

            if (!trimmedMessage || trimmedMessage.length < 5) {
              res.statusCode = 400;
              return res.end(JSON.stringify({ success: false, error: 'Please provide details about your project.' }));
            }

            // 2. Prevent Double Submissions
            if (isDuplicateSubmission(trimmedEmail, trimmedMessage)) {
              console.warn('[Vite Dev API] Duplicate submission suppressed for:', trimmedEmail);
              res.statusCode = 200;
              return res.end(JSON.stringify({
                success: true,
                message: 'Project request received successfully.'
              }));
            }

            // Sanitized Payload
            const inquiryRecord = {
              name: trimmedName,
              company: typeof company === 'string' ? company.trim() : '',
              email: trimmedEmail,
              phone: typeof phone === 'string' ? phone.trim() : '',
              service: trimmedService,
              budget: typeof budget === 'string' ? budget.trim() : 'Not sure yet',
              message: trimmedMessage,
              status: 'new',
              created_at: new Date().toISOString()
            };

            // 3. Insert into Supabase project_inquiries (Primary)
            let insertedIntoSupabase = false;
            if (supabaseUrl && supabaseServiceKey) {
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
                  insertedIntoSupabase = true;
                } else {
                  const errorBody = await supaRes.text();
                  console.error('[Vite Dev API] Supabase insertion notice:', supaRes.status, errorBody);
                }
              } catch (supaErr) {
                console.error('[Vite Dev API] Supabase request error:', supaErr.message);
              }
            }

            // Local Resilient Backup Storage
            try {
              const dataDir = resolve(__dirname, 'data');
              if (!fs.existsSync(dataDir)) {
                fs.mkdirSync(dataDir, { recursive: true });
              }
              const inquiriesFile = resolve(dataDir, 'inquiries.json');
              let existing = [];
              if (fs.existsSync(inquiriesFile)) {
                try {
                  existing = JSON.parse(fs.readFileSync(inquiriesFile, 'utf-8'));
                } catch {
                  existing = [];
                }
              }
              existing.push({
                ...inquiryRecord,
                id: `inq_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
                synced_to_supabase: insertedIntoSupabase
              });
              fs.writeFileSync(inquiriesFile, JSON.stringify(existing, null, 2), 'utf-8');
            } catch (fsErr) {
              console.error('[Vite Dev API] Local backup save error:', fsErr);
            }

            // If Supabase insertion failed, do not send email and return error
            if (!insertedIntoSupabase) {
              res.statusCode = 502;
              return res.end(JSON.stringify({
                success: false,
                error: 'We were unable to record your inquiry at this moment. Please try again or reach us directly on WhatsApp at +91 93616 28990.'
              }));
            }

            // 4. Send Resend Email Notification (Secondary)
            // If Supabase succeeds but Resend fails: enquiry remains safe, do NOT tell visitor it failed
            try {
              await sendResendNotification({
                inquiryRecord,
                apiKey: resendApiKey,
                recipientEmail,
                fromEmail
              });
            } catch (emailErr) {
              console.error('[Vite Dev API] Resend email error:', emailErr.message || emailErr);
            }

            // 5. Return Structured Success Response
            res.statusCode = 200;
            return res.end(JSON.stringify({
              success: true,
              message: 'Project request received successfully.'
            }));

          } catch (err) {
            console.error('[Vite Dev API] Internal error:', err);
            res.statusCode = 500;
            return res.end(JSON.stringify({ success: false, error: 'Internal server error processing inquiry.' }));
          }
        }

        next();
      });
    }
  };
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [contactApiPlugin(env)],
    build: {
      rollupOptions: {
        input: {
          main: resolve(__dirname, 'index.html'),
          contact: resolve(__dirname, 'contact.html'),
          velora: resolve(__dirname, 'work/velora/index.html')
        }
      }
    }
  };
});
