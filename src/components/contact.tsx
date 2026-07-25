import { Container } from "./ui/container";
import { useState } from "react";
import { sendToGoogleSheets } from "../utils/googleSheets";
import { t } from "../utils/i18n";
import { MarketingHeading } from "./marketing/marketing-heading";

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
    <section className="bg-marketing-forest py-24 sm:py-32">
      <Container>
        <div className="mx-auto max-w-2xl text-center">
          <MarketingHeading level="p" variant="eyebrow">
            {t("contact.subtitle", "Contact us")}
          </MarketingHeading>
          <h2 className="mt-2 font-marketing-display text-marketing-3xl font-medium tracking-tight text-white sm:text-marketing-4xl">
            {t("contact.title", "Ready to transform your website?")}
          </h2>
          <p className="mt-6 text-marketing-lg leading-8 text-white/80">
            Fill out the form below and we'll get back to you within 24 hours. Or{" "}
            <a href="/contact#book" className="underline underline-offset-2 hover:text-white">
              book a free intro call
            </a>
            .
          </p>
        </div>

        <form onSubmit={handleSubmit} className="mx-auto mt-16 max-w-xl">
          {status === "success" && (
            <div className="mb-6 rounded-lg border border-green-500/20 bg-green-500/10 p-4">
              <p className="text-marketing-sm text-green-300">
                Message sent successfully. We'll be in touch soon.
              </p>
            </div>
          )}

          {status === "error" && (
            <div className="mb-6 rounded-lg border border-red-500/20 bg-red-500/10 p-4">
              <p className="text-marketing-sm text-red-300">{errorMessage}</p>
            </div>
          )}

          <div className="grid grid-cols-1 gap-x-8 gap-y-6 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label htmlFor="name" className="block text-marketing-sm font-semibold leading-6 text-white">
                Name
              </label>
              <div className="mt-2.5">
                <input
                  type="text"
                  name="name"
                  id="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="block w-full rounded-md border-0 bg-white/10 px-3.5 py-2 text-white shadow-sm ring-1 ring-inset ring-white/10 placeholder:text-white/40 focus:ring-2 focus:ring-inset focus:ring-marketing-sage text-marketing-sm leading-6"
                />
              </div>
            </div>

            <div className="sm:col-span-2">
              <label htmlFor="email" className="block text-marketing-sm font-semibold leading-6 text-white">
                Email
              </label>
              <div className="mt-2.5">
                <input
                  type="email"
                  name="email"
                  id="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="block w-full rounded-md border-0 bg-white/10 px-3.5 py-2 text-white shadow-sm ring-1 ring-inset ring-white/10 placeholder:text-white/40 focus:ring-2 focus:ring-inset focus:ring-marketing-sage text-marketing-sm leading-6"
                />
              </div>
            </div>

            <div className="sm:col-span-2">
              <label htmlFor="phone" className="block text-marketing-sm font-semibold leading-6 text-white">
                Phone (optional)
              </label>
              <div className="mt-2.5">
                <input
                  type="tel"
                  name="phone"
                  id="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="block w-full rounded-md border-0 bg-white/10 px-3.5 py-2 text-white shadow-sm ring-1 ring-inset ring-white/10 placeholder:text-white/40 focus:ring-2 focus:ring-inset focus:ring-marketing-sage text-marketing-sm leading-6"
                />
              </div>
            </div>

            <div className="sm:col-span-2">
              <label htmlFor="message" className="block text-marketing-sm font-semibold leading-6 text-white">
                Message
              </label>
              <div className="mt-2.5">
                <textarea
                  name="message"
                  id="message"
                  rows={4}
                  value={formData.message}
                  onChange={handleChange}
                  required
                  className="block w-full resize-none rounded-md border-0 bg-white/10 px-3.5 py-2 text-white shadow-sm ring-1 ring-inset ring-white/10 placeholder:text-white/40 focus:ring-2 focus:ring-inset focus:ring-marketing-sage text-marketing-sm leading-6"
                  placeholder="Tell us about your project..."
                />
              </div>
            </div>
          </div>

          <div className="mt-10">
            <button
              type="submit"
              disabled={status === "submitting"}
              className="block w-full rounded-md bg-marketing-sage px-3.5 py-2.5 text-center text-marketing-sm font-semibold text-marketing-forest shadow-sm transition-colors hover:bg-marketing-sage/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-marketing-sage disabled:cursor-not-allowed disabled:opacity-50 min-h-[44px]"
            >
              {status === "submitting" ? "Sending..." : "Send message"}
            </button>
          </div>
        </form>
      </Container>
    </section>
  );
}
