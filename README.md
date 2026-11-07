# CallBack — missed-call recovery

Node/TypeScript, Express, PostgreSQL/Prisma and Twilio application for Irish trade businesses. It uses real Twilio Voice `<Dial action>` callbacks for Mode A and real inbound Messaging webhooks. Demo events are stored with a `simulated` flag and are never represented as provider-confirmed activity.

## Run locally

1. Install PostgreSQL and create database `callback`.
2. Copy `.env.example` to `.env`, set a strong `SESSION_SECRET`, `DATABASE_URL`, and `APP_URL` (an HTTPS public tunnel is needed for Twilio testing).
3. `npm install`
4. `npx prisma migrate dev --name init && npm run seed`
5. `npm run dev`
6. Open `http://localhost:3000`; initial operator login is `admin@callback.local` / `ChangeMe123!` (change it immediately).

Run checks: `npm run build && npm test`.

## Twilio setup and exact URLs

Buy/assign compatible numbers in Twilio Console and confirm their capabilities. Add the number under the client in CallBack. A number marked SMS but not two-way cannot be used for reply capture. Configure:

* Voice number, **A call comes in**: `https://YOUR_DOMAIN/webhooks/voice` (POST).
* Each two-way SMS sender, **incoming message**: `https://YOUR_DOMAIN/webhooks/sms` (POST).
* Messaging status callback: `https://YOUR_DOMAIN/webhooks/status` (POST).

Set `TWILIO_ACCOUNT_SID` and `TWILIO_AUTH_TOKEN` as deployment secrets. Webhook signature validation is enabled by default; set `APP_URL` to the exact public origin. Do not disable signature validation outside local development.

### Mode A: Twilio number

Set the business mode to Mode A and callback number. An inbound call is dialled to the owner; only `DialCallStatus` `no-answer`, `busy`, or `failed` creates an SMS job. A completed inbound call itself is never used to determine a miss. Owner voicemail may answer the call and appear completed, so it cannot reliably be classified as a missed call; use a short ring timeout/voicemail configuration and test it.

### Mode B: retain public number

Ask the carrier to conditionally forward no-answer/busy calls to the dedicated Twilio voice number. No second dial is made, avoiding loops. Test whether forwarding retains the original caller ID; calls with no caller ID are logged only and never texted. Calls abandoned before carrier forwarding are not captured. Irish carrier feature availability, forwarding conditions and caller-ID preservation vary and must be verified per client.

## First-client checklist

1. Create the client, choose mode, add verified E.164 numbers.
2. Confirm voice/SMS/two-way capabilities and applicable Twilio verification, number purchase, regulatory/sender-registration requirements.
3. Review consent/lawful basis, privacy notice, retention period and customer disclosure; these features do not make a business automatically compliant.
4. Configure the webhooks and carrier forwarding where applicable.
5. Make a genuine test call from a handset you control; leave it unanswered. Confirm one event and delivery status.
6. Reply to the SMS; verify it appears only in that client’s inbox. Send STOP and confirm suppression before activating.
7. Mark setup tests in your operating procedure and activate only after real verification.

## Deployment (Railway)

Create a Railway PostgreSQL service and app from this repository. Set every `.env.example` value as Railway variables, especially a public HTTPS `APP_URL`. Railway runs `prisma migrate deploy` then the server per `railway.toml`. Set a retention process: periodically delete/anonymise aged enquiries according to documented customer policy, and take encrypted database backups using Railway/Postgres backup procedures. Restore to a separate database first, then validate before cutover.

## Reliability and privacy

Webhook events use Twilio signatures; unique SIDs protect inbound SMS duplicate processing; call SID uniqueness and caller cooldown reduce duplicate sends. Outbox jobs retry transient errors three times and preserve an error rather than inventing delivery. Twilio status callbacks update delivery records. Use data-processing agreements, access controls, retention/deletion procedures and a lawful basis appropriate to the client; obtain professional compliance advice for Irish/EU telecom and GDPR obligations.

## Known limits

Twilio/Irish number inventory and SMS capability change by number type and account. Alphanumeric sender IDs do not support replies; use a two-way number or clearly labelled one-way SMS plus secure enquiry form. Carrier forwarding and voicemail are outside CallBack’s control. Real calls/SMS require Twilio credentials, purchased/authorised numbers, a reachable HTTPS domain, and any account or regulatory approvals; this repository cannot provision or claim those external steps.
