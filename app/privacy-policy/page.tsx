import type { Metadata } from "next";
import PolicyPage, { type PolicySection } from "@/app/components/PolicyPage";

export const metadata: Metadata = {
  title: "Privacy Policy | Weskos Legal Co.",
  description: "Learn what information Weskos Legal Co. receives through this website, how it is used, and how to contact us about privacy.",
};

const sections: PolicySection[] = [
  { title: "Who is responsible", content: <p>Weskos Legal Co. is responsible for information it receives through this website and its communication channels. For privacy questions or requests, email <a href="mailto:weskos.bventure@gmail.com">weskos.bventure@gmail.com</a>.</p> },
  { title: "Information we receive", content: <><p>The public website does not currently have a contact form, newsletter sign-up, advertising tracker, or online checkout. If you contact us through WhatsApp, email, Instagram, or by phone, we receive the details you choose to share, such as your name, contact information, and a description of your business, property, permit, or immigration question.</p><p>The private backoffice uses Google sign-in through Supabase Auth for authorized Weskos staff. Authentication and CMS data are handled by Supabase. The website also stores your display preference in your browser so it can remember light or dark mode.</p><p>Please do not send passports, financial records, or other sensitive documents through ordinary email or social media unless our team has asked you to use an appropriate channel.</p></> },
  { title: "How we use information", content: <p>We use information you send to respond to questions, understand a requested service, coordinate next steps, maintain website operations, protect the private backoffice, and meet applicable legal or record-keeping obligations. We do not sell personal information or use it for targeted advertising.</p> },
  { title: "When information may be shared", content: <p>We may share relevant information with service providers that support website hosting, authentication, storage, or communications; with professional advisers or service partners when needed for a matter and consistent with your instructions; or with an authority where required by law. Some providers may process information outside Indonesia. We do not make client documents public through this website.</p> },
  { title: "Retention and security", content: <p>We keep inquiries and related records for as long as reasonably needed to respond, provide agreed support, maintain business records, or comply with legal obligations. We use access controls and service-provider security features for the systems used by the website, but no method of online transmission or storage can be guaranteed completely secure.</p> },
  { title: "Your choices and requests", content: <p>You may contact us to ask about information you have shared, request correction or deletion where applicable, or withdraw a permission you previously gave. We may need to keep some records where the law requires it or where they are needed to resolve a matter. We will respond in line with applicable law, including Indonesia’s <a href="https://peraturan.bpk.go.id/Details/229798/uu-no-27-tahun-2022" target="_blank" rel="noreferrer">Personal Data Protection Law (Law No. 27 of 2022)</a>.</p> },
  { title: "Third-party services and changes", content: <p>When you follow a link to WhatsApp, Google Maps, Instagram, Google sign-in, or another external service, that provider’s privacy notice applies to its handling of your information. We may update this policy when our practices or website features change. The latest version and revision date will appear on this page.</p> },
];

export default function PrivacyPolicyPage() {
  return <PolicyPage title="Privacy Policy" intro="This page explains what information Weskos receives through this website and how we use it." sections={sections} />;
}
