import { dbConnect } from "@/lib/mongodb";
import { EmailTemplate } from "@/models";
import { sendMailSafe } from "@/lib/mailer";

export type TemplateDefault = {
  key: string;
  label: string;
  description: string;
  subject: string;
  bodyHtml: string;
  variables: string[];
};

const SIGNOFF = "<p>— Team Guidewala</p>";

/**
 * Every transactional email the site sends, with its default copy. Editable
 * from /admin/email-templates — this array is only the seed / fallback so
 * the site keeps working even before an admin has touched a given template.
 */
export const DEFAULT_TEMPLATES: TemplateDefault[] = [
  {
    key: "CONTACT_ADMIN",
    label: "Contact Form — Admin Notification",
    description: "Sent to the Guidewala team whenever someone submits the Contact Us form.",
    subject: "New contact form enquiry: {{subject}}",
    bodyHtml: `
      <h3>New Contact Form Submission</h3>
      <p><strong>Name:</strong> {{name}}</p>
      <p><strong>Phone:</strong> {{phone}}</p>
      <p><strong>Email:</strong> {{email}}</p>
      <p><strong>Subject:</strong> {{subject}}</p>
      <p><strong>Message:</strong></p>
      <p>{{message}}</p>
    `,
    variables: ["name", "phone", "email", "subject", "message"],
  },
  {
    key: "CONTACT_CUSTOMER",
    label: "Contact Form — Customer Auto-Reply",
    description: "Sent back to the visitor right after they submit the Contact Us form.",
    subject: "We've received your message — Guidewala",
    bodyHtml: `
      <p>Hi {{name}},</p>
      <p>Thanks for reaching out to Guidewala! We've received your query and our team will reply to you shortly.</p>
      <p><strong>Your message:</strong> {{message}}</p>
      ${SIGNOFF}
    `,
    variables: ["name", "email", "message"],
  },
  {
    key: "GUIDE_REGISTRATION_ADMIN",
    label: "Guide Registration — Admin Notification",
    description: "Sent to the Guidewala team when a new guide registers.",
    subject: "New Guide Registration — {{name}}",
    bodyHtml: `
      <h3>New Guide Registration</h3>
      <p><strong>Name:</strong> {{name}}</p>
      <p><strong>Phone:</strong> {{phone}}</p>
      <p><strong>Email:</strong> {{email}}</p>
      <p><strong>Address:</strong> {{address}}</p>
      <p><strong>Languages:</strong> {{languages}}</p>
      <p><strong>Experience Cities:</strong> {{expCities}}</p>
      <p>Next step: review and Accept / Reject this guide from the admin panel.</p>
    `,
    variables: ["name", "phone", "email", "address", "languages", "expCities"],
  },
  {
    key: "GUIDE_REGISTRATION_CUSTOMER",
    label: "Guide Registration — Applicant Thank You",
    description: "Sent to the applicant right after they submit the guide registration form.",
    subject: "Guidewala — Registration received",
    bodyHtml: `
      <p>Hi {{name}},</p>
      <p>Thanks for registering as a guide with Guidewala! We've received your details and our team
      will review them shortly and get back to you.</p>
      ${SIGNOFF}
    `,
    variables: ["name", "email"],
  },
  {
    key: "GUIDE_ACCEPTED",
    label: "Guide Registration — Accepted",
    description: "Sent to a guide when the admin approves their registration.",
    subject: "You're approved! Welcome to Guidewala",
    bodyHtml: `
      <p>Hi {{name}},</p>
      <p>Great news — your guide registration with Guidewala has been <strong>accepted</strong>! You're now part of
      India's trusted guide network.</p>
      <p>Our team will reach out with the next steps to get you your first bookings.</p>
      ${SIGNOFF}
    `,
    variables: ["name", "email", "phone"],
  },
  {
    key: "GUIDE_REJECTED",
    label: "Guide Registration — Rejected",
    description: "Sent to a guide when the admin declines their registration.",
    subject: "Update on your Guidewala guide registration",
    bodyHtml: `
      <p>Hi {{name}},</p>
      <p>Thank you for your interest in joining Guidewala as a guide. After reviewing your application, we're
      unable to approve it at this time.</p>
      <p>If you believe this is a mistake or would like to re-apply with updated details, please contact us.</p>
      ${SIGNOFF}
    `,
    variables: ["name", "email", "phone"],
  },
  {
    key: "GUIDE_BOOKING_ADMIN",
    label: "Guide Booking — Admin Notification",
    description: "Sent to the Guidewala team for every new guide-tour booking enquiry.",
    subject: "New Guide Booking — {{bookingId}}",
    bodyHtml: `
      <h3>New Guide Booking Request</h3>
      <p><strong>Booking ID:</strong> {{bookingId}}</p>
      <p><strong>Package ID:</strong> {{pkgId}} &nbsp; <strong>Amount:</strong> ₹{{bookingAmount}}</p>
      <p><strong>Name:</strong> {{name}}</p>
      <p><strong>Phone:</strong> {{phone}}</p>
      <p><strong>Email:</strong> {{email}}</p>
      <p><strong>Date of Sightseeing:</strong> {{dateOfSightseeing}} at {{timeOfReporting}}</p>
      <p><strong>Hotel of Reporting:</strong> {{reportingHotel}}</p>
      <p><strong>Guide Language:</strong> {{guideLanguage}}</p>
      <p><strong>Passengers:</strong> {{numberOfPersons}}</p>
      <p><strong>Message:</strong> {{message}}</p>
    `,
    variables: [
      "bookingId",
      "pkgId",
      "bookingAmount",
      "name",
      "phone",
      "email",
      "dateOfSightseeing",
      "timeOfReporting",
      "reportingHotel",
      "guideLanguage",
      "numberOfPersons",
      "message",
    ],
  },
  {
    key: "GUIDE_BOOKING_CUSTOMER",
    label: "Guide Booking — Customer Confirmation",
    description: "Sent to the customer right after they submit a guide-tour booking.",
    subject: "Guidewala booking received — {{bookingId}}",
    bodyHtml: `
      <p>Hi {{name}},</p>
      <p>Thanks for booking with Guidewala! Your booking reference is <strong>{{bookingId}}</strong>.</p>
      <p>Our team will confirm your guide shortly. Payment is collected in advance via Google Pay / UPI —
      we'll share the details on WhatsApp.</p>
      ${SIGNOFF}
    `,
    variables: ["name", "email", "bookingId"],
  },
  {
    key: "TAXI_BOOKING_ADMIN",
    label: "Taxi Booking — Admin Notification",
    description: "Sent to the Guidewala team for every new taxi booking enquiry.",
    subject: "New Taxi Booking Enquiry — {{bookingId}}",
    bodyHtml: `
      <h3>New Taxi Booking Enquiry</h3>
      <p><strong>Booking ID:</strong> {{bookingId}}</p>
      <p><strong>Name:</strong> {{name}}</p>
      <p><strong>Phone:</strong> {{phone}}</p>
      <p><strong>Email:</strong> {{email}}</p>
      <p><strong>City:</strong> {{city}}</p>
      <p><strong>Address:</strong> {{address}}</p>
      <p><strong>Date of Travel:</strong> {{dateOfTravel}}</p>
      <p><strong>Vehicle:</strong> {{vehicleType}}</p>
      <p><strong>Passengers:</strong> {{numberOfPersons}}</p>
      <p><strong>Tour Plan:</strong> {{tourPlan}}</p>
    `,
    variables: [
      "bookingId",
      "name",
      "phone",
      "email",
      "city",
      "address",
      "dateOfTravel",
      "vehicleType",
      "numberOfPersons",
      "tourPlan",
    ],
  },
  {
    key: "TAXI_BOOKING_CUSTOMER",
    label: "Taxi Booking — Customer Confirmation",
    description: "Sent to the customer right after they submit a taxi booking enquiry.",
    subject: "Guidewala taxi enquiry received — {{bookingId}}",
    bodyHtml: `
      <p>Hi {{name}},</p>
      <p>Thanks for your taxi booking enquiry with Guidewala! Your reference is <strong>{{bookingId}}</strong>.</p>
      <p>Our team will confirm your ride shortly and reach out with pricing and driver details.</p>
      ${SIGNOFF}
    `,
    variables: ["name", "email", "bookingId"],
  },
  {
    key: "HOTEL_BOOKING_ADMIN",
    label: "Hotel Booking — Admin Notification",
    description: "Sent to the Guidewala team for every new hotel booking enquiry.",
    subject: "New Hotel Booking Enquiry — {{bookingId}}",
    bodyHtml: `
      <h3>New Hotel Booking Enquiry</h3>
      <p><strong>Booking ID:</strong> {{bookingId}}</p>
      <p><strong>Name:</strong> {{name}}</p>
      <p><strong>Phone:</strong> {{phone}}</p>
      <p><strong>Email:</strong> {{email}}</p>
      <p><strong>City:</strong> {{city}}</p>
      <p><strong>Guests / Rooms:</strong> {{numberOfGuests}} / {{numberOfRooms}}</p>
      <p><strong>Room Type:</strong> {{roomType}}</p>
      <p><strong>Category:</strong> {{hotelCategory}}</p>
      <p><strong>Arrival:</strong> {{arrivalDate}} &nbsp; <strong>Departure:</strong> {{departureDate}}</p>
      <p><strong>Other Info:</strong> {{otherInfo}}</p>
    `,
    variables: [
      "bookingId",
      "name",
      "phone",
      "email",
      "city",
      "numberOfGuests",
      "numberOfRooms",
      "roomType",
      "hotelCategory",
      "arrivalDate",
      "departureDate",
      "otherInfo",
    ],
  },
  {
    key: "HOTEL_BOOKING_CUSTOMER",
    label: "Hotel Booking — Customer Confirmation",
    description: "Sent to the customer right after they submit a hotel booking enquiry.",
    subject: "Guidewala hotel enquiry received — {{bookingId}}",
    bodyHtml: `
      <p>Hi {{name}},</p>
      <p>Thanks for your hotel booking enquiry with Guidewala! Your reference is <strong>{{bookingId}}</strong>.</p>
      <p>Our team will confirm availability and pricing shortly.</p>
      ${SIGNOFF}
    `,
    variables: ["name", "email", "bookingId"],
  },
];

const DEFAULTS_BY_KEY = new Map(DEFAULT_TEMPLATES.map((t) => [t.key, t]));

function fill(text: string, vars: Record<string, string | number | undefined>) {
  return text.replace(/{{\s*(\w+)\s*}}/g, (_, name) => {
    const v = vars[name];
    return v === undefined || v === null || v === "" ? "—" : String(v);
  });
}

/** Loads a template from the DB, falling back to (and lazily persisting) the built-in default. */
export async function getTemplate(key: string) {
  await dbConnect();
  let doc = await EmailTemplate.findOne({ KEY: key }).lean();
  if (!doc) {
    const def = DEFAULTS_BY_KEY.get(key);
    if (!def) throw new Error(`Unknown email template key: ${key}`);
    doc = await EmailTemplate.create({
      KEY: def.key,
      LABEL: def.label,
      DESCRIPTION: def.description,
      SUBJECT: def.subject,
      BODY_HTML: def.bodyHtml,
      VARIABLES: def.variables,
      UPDATED_ON: new Date(),
    });
  }
  return doc as unknown as {
    KEY: string;
    LABEL: string;
    DESCRIPTION: string;
    SUBJECT: string;
    BODY_HTML: string;
    VARIABLES: string[];
  };
}

/** Ensures every default template exists in the DB (called from the admin list page). */
export async function ensureAllTemplatesSeeded() {
  await dbConnect();
  for (const def of DEFAULT_TEMPLATES) {
    const exists = await EmailTemplate.findOne({ KEY: def.key }).select("_id").lean();
    if (!exists) {
      await EmailTemplate.create({
        KEY: def.key,
        LABEL: def.label,
        DESCRIPTION: def.description,
        SUBJECT: def.subject,
        BODY_HTML: def.bodyHtml,
        VARIABLES: def.variables,
        UPDATED_ON: new Date(),
      });
    }
  }
}

/** Renders a template's subject + body with the given variables filled in. */
export async function renderTemplate(key: string, vars: Record<string, string | number | undefined>) {
  const tpl = await getTemplate(key);
  return { subject: fill(tpl.SUBJECT, vars), html: fill(tpl.BODY_HTML, vars) };
}

/** Renders a template and sends it — the one call site code should use. */
export async function sendTemplateMail(
  key: string,
  to: string,
  vars: Record<string, string | number | undefined>
) {
  const { subject, html } = await renderTemplate(key, vars);
  return sendMailSafe({ to, subject, html });
}
