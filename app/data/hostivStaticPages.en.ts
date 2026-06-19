import type { HostivStaticPage, HostivStaticPageId } from "./hostiv-static-page.types"
import { hostivLegalEditor, hostivLegalHosting } from "./hostiv-legal-editor"

const { fullName, tradeName, domain, email, postalAddress, phone } = hostivLegalEditor
const { vercel, supabase } = hostivLegalHosting

export const hostivStaticPagesEn: Record<HostivStaticPageId, HostivStaticPage> = {
  "a-propos": {
    id: "a-propos",
    path: "/en/about",
    title: "About us",
    seoTitle: "About Hostiv | Vacation rental website generator",
    description:
      "Hostiv helps short-term rental hosts receive direct bookings with a dedicated website and Stripe payments.",
    seoDescription:
      "Hostiv is a holiday rental website builder for hosts: direct booking, iCal sync and Stripe payments with no commission on stays.",
    eyebrow: "About",
    lead: "Hostiv was born from a simple observation: hosts lose a significant share of revenue to platform commissions.",
    sections: [
      {
        title: "Our mission",
        paragraphs: [
          "We let every host publish a direct booking website for one property — with calendar sync, secure payments and reservation management.",
          "Hostiv does not replace Airbnb or Booking: it complements your strategy by giving you a direct channel you control."
        ]
      },
      {
        title: "What we do — and what we don’t",
        paragraphs: [
          "Hostiv is a publishing and management tool for independent hosts. We are not a marketplace and we do not charge commission on your nights."
        ],
        list: [
          "One showcase + booking site per property",
          "Stripe Connect payments to your account",
          "iCal sync with your other channels",
          "No intermediation on the stay amount"
        ]
      }
    ]
  },
  contact: {
    id: "contact",
    path: "/en/contact",
    title: "Contact us",
    seoTitle: "Contact Hostiv | Host support",
    description:
      "Contact the Hostiv team for any question about your account, website or direct bookings.",
    seoDescription:
      "Questions about your Hostiv account, subscription or website? Contact our team — reply within 2 business days.",
    eyebrow: "Contact",
    lead: "A question about Hostiv, your subscription or publishing your site? Write to us.",
    sections: [
      {
        title: "Contact form",
        paragraphs: [
          "Use the form to send us your message. We reply by email, usually within 2 business days."
        ],
        info: {
          title: "Before you write",
          paragraphs: [
            "For questions about a booking already made on your site, include your site address and the stay dates concerned.",
            "For a Stripe payment issue, first check your Connect account status in your admin area."
          ]
        }
      }
    ]
  },
  "mentions-legales": {
    id: "mentions-legales",
    path: "/en/legal-notice",
    title: "Legal notice",
    seoTitle: "Legal notice | Hostiv",
    description: "Legal notice for the Hostiv website — publisher, hosting and intellectual property.",
    seoDescription:
      "Publisher, hosting and intellectual property information for the Hostiv website.",
    eyebrow: "Legal information",
    lead: "Information required under French law on confidence in the digital economy (LCEN).",
    updatedAt: "May 2026",
    sections: [
      {
        title: "Website publisher",
        paragraphs: [
          `The website ${domain} is published by ${fullName}, individual, trading as « ${tradeName} ».`,
          `Postal address: ${postalAddress}.`,
          `Contact: ${email} — Tel. ${phone}.`,
          `${tradeName} is a service under development, operated personally. No legal entity has been formed to date; there is no SIRET number associated with the trade name ${tradeName}.`
        ]
      },
      {
        title: "Publication director",
        paragraphs: [`${fullName}.`]
      },
      {
        title: "Hosting",
        paragraphs: [
          `The site and application are hosted by ${vercel.name}, ${vercel.address} — ${vercel.website}.`,
          `Application data (accounts, host site content, bookings) is stored via ${supabase.name}, ${supabase.region} — ${supabase.website}.`
        ]
      },
      {
        title: "Intellectual property",
        paragraphs: [
          `All elements of the ${tradeName} website (text, graphics, logo, structure) are protected by intellectual property law unless otherwise stated.`,
          "Content published by hosts on their booking sites (text, photos) remains their responsibility; they warrant they hold the necessary rights.",
          "Any unauthorised reproduction of Hostiv website elements is prohibited."
        ]
      }
    ]
  },
  "politique-de-confidentialite": {
    id: "politique-de-confidentialite",
    path: "/en/privacy-policy",
    title: "Privacy policy",
    seoTitle: "Privacy policy | Hostiv",
    description:
      "How Hostiv collects and processes your personal data — hosts, guests and marketing site visitors.",
    seoDescription:
      "Hostiv personal data: processing for hosts, guests and visitors. Your GDPR rights and the host’s role.",
    eyebrow: "Personal data",
    lead: "This policy describes processing carried out by the Hostiv service publisher and the role of hosts for data collected on their sites.",
    updatedAt: "May 2026",
    sections: [
      {
        title: "Data controller",
        paragraphs: [
          `For the marketing site ${domain}, host account creation, annual plan billing and support: ${fullName}, ${email}.`,
          "For booking sites published by our customers (hosts), each host is data controller for data they collect from guests (name, contact details, stay, etc.). Hostiv then acts as technical processor for hosting and processing that data within the service."
        ]
      },
      {
        title: "Data collected",
        paragraphs: ["Depending on how you use the service, we may process in particular:"],
        list: [
          "Identity and contact details (name, email) when creating a host account",
          "Login credentials (password stored securely by our authentication provider)",
          "Connection data, technical logs and IP address",
          "Content you publish on your site (text, photos, rates)",
          "Booking data entered by guests on your site",
          "Stripe account identifiers and status (Hostiv plan payment and, where applicable, Stripe Connect for stay payments)",
          "Messages sent via the contact form"
        ]
      },
      {
        title: "Purposes and legal bases",
        paragraphs: [
          "Providing the Hostiv service, account management, annual plan billing, customer support, security, fraud prevention and product improvement.",
          "Legal bases are mainly contract performance (terms / plan), legitimate interest (security, service improvement) and, where applicable, legal obligations."
        ]
      },
      {
        title: "Cookies and trackers",
        paragraphs: [
          `We do not use advertising cookies or audience measurement (analytics) tools on ${domain}.`,
          "Only cookies or local storage strictly necessary for operation may be used (e.g. authentication session, security). On host booking sites, local storage may remember contact form preferences for visitor convenience.",
          "You can configure your browser to refuse cookies; some features (admin login, booking) may then not work correctly."
        ]
      },
      {
        title: "Retention period",
        paragraphs: [
          "Host account data is kept for the paid plan access period, then deleted or archived within twelve (12) months after account closure, unless a legal obligation requires otherwise.",
          "Technical logs are kept for a limited period (generally a few months).",
          "Booking data on a host site is kept according to admin settings and the host’s obligations as data controller."
        ]
      },
      {
        title: "Your rights",
        paragraphs: [
          "Under EU Regulation 2016/679 (GDPR), you have rights of access, rectification, erasure, restriction, objection and portability, within legal limits.",
          `To exercise your rights regarding Hostiv: ${email}. For data collected on a host site, contact the host directly.`,
          "You may lodge a complaint with the CNIL (www.cnil.fr)."
        ]
      },
      {
        title: "Processors and transfers",
        paragraphs: ["We use the following providers acting on our behalf under data protection agreements:"],
        list: [
          `${vercel.name} — application hosting`,
          `${supabase.name} — database and authentication (${supabase.region})`,
          "Stripe, Inc. — annual plan payment and Connect payment facilitation (data may be processed in the United States with appropriate safeguards)",
          "Resend — transactional and contact emails"
        ]
      }
    ]
  },
  "conditions-generales": {
    id: "conditions-generales",
    path: "/en/terms-of-use",
    title: "Terms of use",
    seoTitle: "Hostiv terms of use | Service conditions",
    description: "Terms of use of the Hostiv service for hosts.",
    seoDescription: "Terms of use of the Hostiv service for short-term rental hosts.",
    eyebrow: "Terms",
    lead: "These terms govern access to and use of the Hostiv service by hosts. By creating an account, you accept them.",
    updatedAt: "May 2026",
    sections: [
      {
        title: "Purpose",
        paragraphs: [
          `${tradeName} provides an online tool to create and manage a direct booking website for one property, including calendar sync (iCal) and Stripe payment integration.`,
          `${tradeName} is not a travel agency or marketplace: it is not party to rental contracts between host and guest.`
        ]
      },
      {
        title: "Publisher and acceptance",
        paragraphs: [
          `The service is published by ${fullName}, individual, trading as ${tradeName}, reachable at ${email}.`,
          "Use of the service is reserved for adults with legal capacity. The host warrants the accuracy of information provided at sign-up."
        ]
      },
      {
        title: "Account and annual plan",
        paragraphs: [
          "One account corresponds to one property. The host chooses a plan (Starter or Pro) shown on the site Pricing page.",
          "Service access is billed for a twelve (12) month period at the annual rate shown on the site. Payment is made in one instalment via Stripe (secure payment), with no automatic renewal: after twelve months, the host may optionally subscribe again to extend access at then-current rates.",
          "Hostiv plan payment is separate from stay payments: those are processed on the host’s Stripe Connect account under the host’s responsibility."
        ]
      },
      {
        title: "Right of withdrawal",
        paragraphs: [
          "If the host is a consumer under French law, they may have a fourteen (14) day withdrawal period for a distance contract plan, unless express waiver applies when service execution begins immediately after subscription.",
          `Any withdrawal or refund request must be sent to ${email} within legal time limits, stating the account email concerned.`
        ]
      },
      {
        title: "Host obligations",
        paragraphs: ["The host is solely responsible for:"],
        list: [
          "Content published on their site (accuracy, compliance, copyright and image rights)",
          "Compliance with applicable regulations (short-term rental, planning, tax, declarations)",
          "Relations with guests and performance of stays",
          "Configuration, compliance and proper operation of their Stripe Connect account",
          "Processing guests’ personal data in compliance with GDPR"
        ]
      },
      {
        title: "Service availability",
        paragraphs: [
          `${tradeName} is provided “as is”. The publisher uses reasonable means to ensure availability without guaranteeing uninterrupted or error-free service.`,
          "Maintenance or incidents at technical providers (hosting, database, Stripe) may cause temporary unavailability."
        ]
      },
      {
        title: "Personal data",
        paragraphs: [
          `Data processing within the service is described in the Privacy policy. For any question: ${email}.`
        ]
      },
      {
        title: "Limitation of liability",
        paragraphs: [
          `${tradeName} shall not be liable for indirect damage, loss of revenue, stay cancellations or disputes between hosts and guests.`,
          `The publisher’s liability, for all causes combined, is limited to the total amounts actually paid by the host for the ${tradeName} plan over the twelve (12) months preceding the event giving rise to liability.`
        ]
      },
      {
        title: "Changes to terms",
        paragraphs: [
          "These terms may be updated. In case of material change, hosts will be informed by email or via the admin area. Continued use after effective date constitutes acceptance, unless termination under applicable conditions."
        ]
      },
      {
        title: "Governing law and disputes",
        paragraphs: [
          "These terms are governed by French law.",
          `In case of dispute, and failing amicable resolution, courts at the publisher’s domicile (${fullName}) shall have jurisdiction, subject to mandatory consumer provisions (including the consumer’s home court).`
        ]
      }
    ]
  }
}
