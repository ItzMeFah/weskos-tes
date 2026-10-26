import type { Metadata } from "next";
import PolicyPage, { type PolicySection } from "@/app/components/PolicyPage";

export const metadata: Metadata = {
  title: "Cookie Policy | Weskos Legal Co.",
  description: "Information about browser storage used by the Weskos Legal Co. website.",
};

const sections: PolicySection[] = [
  { title: "What this site stores", content: <p>The public Weskos website uses browser storage to remember your light or dark display preference. This setting is stored locally in your browser and is not used to identify you or track you across other websites.</p> },
  { title: "Backoffice sign-in", content: <p>When an authorized Weskos staff member signs in to the private backoffice with Google through Supabase Auth, the authentication provider stores session information in the browser so the signed-in session can work. This is used only for backoffice authentication and access control.</p> },
  { title: "Analytics and third-party links", content: <p>The site does not currently use advertising cookies or third-party analytics cookies. Links to WhatsApp, Google Maps, Instagram, and other external services may take you to services that use their own cookies or browser storage under their own policies.</p> },
  { title: "Managing browser storage", content: <p>You can clear site data through your browser settings. Clearing it may reset your theme preference or sign an authorized backoffice user out. If the site later adds analytics, advertising, or other non-essential storage, this policy should be updated to describe it and explain any choices available.</p> },
];

export default function CookiePolicyPage() {
  return <PolicyPage title="Cookie Policy" intro="Here is a short explanation of cookies and browser storage currently used by this website." sections={sections} />;
}
