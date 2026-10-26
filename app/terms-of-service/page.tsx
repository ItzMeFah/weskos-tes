import type { Metadata } from "next";
import PolicyPage, { type PolicySection } from "@/app/components/PolicyPage";

export const metadata: Metadata = {
  title: "Terms of Service | Weskos Legal Co.",
  description: "Terms for using the Weskos Legal Co. website and contacting our team about business, permits, property, and immigration support.",
};

const sections: PolicySection[] = [
  { title: "Using this website", content: <p>These terms apply when you visit or use the Weskos Legal Co. website. By using the site, you agree to these terms. If you do not agree, please stop using the site.</p> },
  { title: "Website information is general", content: <><p>Our pages introduce Weskos and describe areas where clients may request guidance. Website content is general information and is not legal, tax, investment, immigration, or property advice for your particular situation.</p><p>Viewing the site, sending a message, or speaking with our team does not by itself create a formal client engagement or professional relationship. Any agreed service, scope, fee, timeline, and responsibilities will be confirmed separately in writing before work begins.</p></> },
  { title: "Services and outcomes", content: <><p>Service requirements vary with the facts of each matter and with rules, documents, decisions, and processing times controlled by government agencies or other third parties. Weskos does not guarantee that an application, registration, permit, visa, property transaction, or other outcome will be approved or completed by a particular date.</p><p>Do not rely on a website description as confirmation that a service is available or that you qualify. Contact us to discuss your circumstances and confirm the scope in writing.</p></> },
  { title: "Your responsibilities", content: <p>Please provide accurate information, keep copies of documents you share, and only provide information you are authorized to disclose. Do not use this site to break the law, interfere with its operation, impersonate another person, or submit harmful code. Please do not send passports, financial records, or other sensitive documents through ordinary email or social media unless our team has asked you to use an appropriate channel.</p> },
  { title: "Site content and third-party links", content: <><p>Unless a credit or separate notice says otherwise, the website design, text, and Weskos brand materials belong to Weskos or are used with permission. You may view and share links to the site for personal and informational use. Do not copy or republish substantial material for commercial use without written permission.</p><p>Links to services such as WhatsApp, Google Maps, Instagram, or other third-party sites are provided for convenience. Those services are operated under their own terms and privacy policies, and Weskos does not control them.</p></> },
  { title: "Availability and changes", content: <p>We may update, suspend, or remove website content or features as the business changes. We aim to keep information useful, but cannot promise that every page is complete, current, or continuously available. We may revise these terms by publishing an updated version here.</p> },
  { title: "Applicable law and questions", content: <p>These terms are governed by the laws of the Republic of Indonesia, subject to any mandatory protections that apply to you. If you have a concern about the site or these terms, contact us at <a href="mailto:weskos.bventure@gmail.com">weskos.bventure@gmail.com</a> or <a href="https://wa.me/6281511184631">+62 815-1118-4631</a>. Nothing in these terms limits rights that cannot lawfully be limited under applicable consumer protection law, including <a href="https://peraturan.bpk.go.id/Home/Details/45288/uu-no-8-tahun-1999.8Presiden" target="_blank" rel="noreferrer">Indonesia’s Consumer Protection Law</a>.</p> },
];

export default function TermsOfServicePage() {
  return <PolicyPage title="Terms of Service" intro="Please read these terms before using the Weskos Legal Co. website or contacting our team." sections={sections} />;
}
