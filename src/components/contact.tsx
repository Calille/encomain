import { useState } from "react";
import { sendToGoogleSheets } from "../utils/googleSheets";
import { MarketingHeading } from "./marketing/marketing-heading";
import { CtaButton } from "./marketing/cta-button";
import { Section } from "./marketing/section";
import { whatsappLink } from "../config/marketing";

/*
  Fields sit on a solid navy surface with a real border. The previous
  bg-white/10 + ring-white/10 combination left the inputs almost invisible.
*/
const fieldClasses =
  "block w-full rounded-xl border border-marketing-navy-700 bg-marketing-navy-800 px-4 py-3 text-marketing-base leading-6 text-white transition-colors placeholder:text-marketing-sky/40 hover:border-marketing-blue/50 focus:border-marketing-blue focus:outline-none focus:ring-2 focus:ring-marketing-blue/40";

const labelClasses =
  "block text-marketing-sm font-semibold leading-6 text-marketing-sky";

declare global {
  interface Window {
    gtag?: (command: string, action: string, params: object) => void;
  }
}

export default function Contact() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  });
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatus("submitting");
    setErrorMessage("");

    try {
      const submissionData = {
        ...formData,
        source: "Homepage Contact Form",
        timestamp: new Date().toISOString(),
      };

      const result = await sendToGoogleSheets(submissionData);

      if (result.success) {
        setStatus("success");
        setFormData({ name: "", email: "", phone: "", message: "" });

        if (typeof window !== "undefined" && window.gtag) {
          window.gtag("event", "form_submission", {
            event_category: "engagement",
            event_label: "contact_form",
          });
        }

        setTimeout(() => setStatus("idle"), 5000);
      } else {
        setStatus("error");
        setErrorMessage(result.message || "Failed to send message");
      }
    } catch {
      setStatus("error");
      setErrorMessage("An error occurred. Please try again.");
    }
  };

  return (
    <Section tone="navy-deep" size="lg" hairline className="overflow-hidden">
      <div
        className="pointer-events-none absolute inset-x-0 top-0 mx-auto h-[440px] w-[820px] max-w-[120vw] rounded-full bg-marketing-blue/10 blur-[150px]"
        aria-hidden="true"
      />

      <div className="relative">
        <div className="mx-auto max-w-2xl text-center">
          <MarketingHeading level="p" variant="eyebrow" tone="dark">
            Contact
          </MarketingHeading>
          <MarketingHeading level="h2" variant="section" tone="dark" className="mt-2">
            Tell us what's not working
          </MarketingHeading>
          <p className="mt-6 text-marketing-lg leading-8 text-marketing-sky/85">
            Send a short note and we'll reply within 24 hours. Or{" "}
            <a
              href="/contact#book"
              className="marketing-focus rounded text-marketing-blue-bright underline underline-offset-4 hover:text-white"
            >
              book a 20 min chat
            </a>
            . Prefer WhatsApp?{" "}
            <a
              href={whatsappLink()}
              target="_blank"
              rel="noopener noreferrer"
              className="marketing-focus rounded text-marketing-blue-bright underline underline-offset-4 hover:text-white"
            >
              Message us here
            </a>
            .
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="marketing-glow-lg mx-auto mt-14 max-w-xl rounded-3xl border border-marketing-navy-700 bg-marketing-navy-900/70 p-6 backdrop-blur sm:p-8"
        >
          {status === "success" && (
            <div className="mb-6 rounded-xl border border-success/40 bg-success/15 p-4">
              <p className="text-marketing-sm text-white">
                Message sent successfully. We'll be in touch soon.
              </p>
            </div>
          )}

          {status === "error" && (
            <div className="mb-6 rounded-xl border border-destructive/40 bg-destructive/15 p-4">
              <p className="text-marketing-sm text-white">{errorMessage}</p>
            </div>
          )}

          <div className="grid grid-cols-1 gap-x-8 gap-y-5 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label htmlFor="name" className={labelClasses}>
                Name
              </label>
              <div className="mt-2">
                <input
                  type="text"
                  name="name"
                  id="name"
                  autoComplete="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className={fieldClasses}
                />
              </div>
            </div>

            <div className="sm:col-span-2">
              <label htmlFor="email" className={labelClasses}>
                Email
              </label>
              <div className="mt-2">
                <input
                  type="email"
                  name="email"
                  id="email"
                  autoComplete="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className={fieldClasses}
                />
              </div>
            </div>

            <div className="sm:col-span-2">
              <label htmlFor="phone" className={labelClasses}>
                Phone (optional)
              </label>
              <div className="mt-2">
                <input
                  type="tel"
                  name="phone"
                  id="phone"
                  autoComplete="tel"
                  value={formData.phone}
                  onChange={handleChange}
                  className={fieldClasses}
                />
              </div>
            </div>

            <div className="sm:col-span-2">
              <label htmlFor="message" className={labelClasses}>
                Message
              </label>
              <div className="mt-2">
                <textarea
                  name="message"
                  id="message"
                  rows={4}
                  value={formData.message}
                  onChange={handleChange}
                  required
                  className={`${fieldClasses} resize-none`}
                  placeholder="Tell us about your project..."
                />
              </div>
            </div>
          </div>

          <div className="mt-8">
            <CtaButton
              type="submit"
              variant="on-dark"
              disabled={status === "submitting"}
              fullWidth
            >
              {status === "submitting" ? "Sending..." : "Send message"}
            </CtaButton>
          </div>
        </form>
      </div>
    </Section>
  );
}
