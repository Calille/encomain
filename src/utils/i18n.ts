// Simple internationalization utility

type Translations = {
  [key: string]: {
    [key: string]: string;
  };
};

// Define translations
const translations: Translations = {
  en: {
    // Navigation
    "nav.home": "Home",
    "nav.services": "Services",
    "nav.pricing": "Pricing",
    "nav.about": "About",
    "nav.contact": "Contact",
    "nav.login": "Log in",
    "nav.signup": "Sign up",
    "nav.dashboard": "Dashboard",

    // Common buttons
    "button.getStarted": "Get Started",
    "button.learnMore": "Learn More",
    "button.contactUs": "Contact Us",
    "button.getFreeAudit": "Book Your Free Consultation Call",

    // Hero section
    "hero.title": "We Transform Outdated Websites Into Conversion Machines.",
    "hero.subtitle":
      "If your website looks like it's from 2013, it is costing you leads.",

    // Contact form
    "contact.title": "Get in Touch",
    "contact.subtitle":
      "Have a question or ready to transform your website? We're here to help. Fill out the form below and we'll get back to you within 24 hours.",
    "contact.name": "Name",
    "contact.email": "Email",
    "contact.phone": "Phone",
    "contact.company": "Company",
    "contact.website": "Current Website URL",
    "contact.businessType": "Business Type",
    "contact.selectBusinessType": "Select a business type",
    "contact.smallBusiness": "Small Business",
    "contact.mediumBusiness": "Medium Business",
    "contact.ecommerce": "E-commerce",
    "contact.professionalServices": "Professional Services",
    "contact.other": "Other",
    "contact.message": "Message",
    "contact.messagePlaceholder": "Tell us about your project...",
    "contact.submit": "Send Message",
    "contact.sending": "Sending...",
    "contact.success": "Thank You!",
    "contact.successMessage":
      "Your message has been sent successfully. We'll get back to you within 24 hours.",
    "contact.sendAnother": "Send Another Message",
    "contact.contactInfo": "Contact Information",
    "contact.availability":
      "We're available Monday through Friday, 9am to 5pm GMT. Feel free to reach out with any questions or to schedule a consultation.",
    "contact.emailLabel": "Email",
    "contact.phoneLabel": "Phone",
    "contact.locationLabel": "Location",
    "contact.hoursLabel": "Business Hours",
    "contact.weekdayHours": "Monday - Friday: 9am - 5pm GMT",
    "contact.weekendHours": "Saturday - Sunday: Closed",
    "contact.scheduleCall": "Schedule a Call",
    "contact.preferCall":
      "Prefer to talk directly? Schedule a free 30-minute consultation with one of our experts.",
    "contact.bookConsultation": "Book a Free Consultation",

    // Footer
    "footer.cta": "Ready to transform your website?",
    "footer.ctaButton": "Let's Talk",
    "footer.tagline":
      "If your website looks like it's from 2013, it is costing you leads.",
    "footer.navigation": "Navigation",
    "footer.services": "Services",
    "footer.company": "Company",
    "footer.legal": "Legal",

    // FAQ section
    "faq.title": "Common Questions",
    "faq.subtitle":
      "Find answers to frequently asked questions about our services.",
    "faq.q1": "How quickly can you deliver my new website?",
    "faq.a1":
      "We guarantee quick delivery after receiving all necessary content and completing the discovery phase.",
    "faq.q2": "What information do you need from me to get started?",
    "faq.a2":
      "We'll need your current website URL, brand assets (logo, colours, etc.), content for your pages, and information about your target audience and business goals.",
    "faq.q3": "Do you offer ongoing support after the website is launched?",
    "faq.a3":
      "Yes, we offer various support packages to ensure your website continues to perform at its best. Our Standard and Premium packages include support periods.",
    "faq.q4": "How does the free website audit work?",
    "faq.a4":
      "We'll analyse your current website for design, user experience, performance, SEO, and conversion optimisation opportunities. You'll receive a detailed report with actionable recommendations.",
    "faq.q5": "Do you work with e-commerce websites?",
    "faq.a5":
      "Absolutely! We have extensive experience building and optimising e-commerce websites across various platforms including Shopify, WooCommerce, and custom solutions.",
    "faq.q6": "What payment methods do you accept?",
    "faq.a6":
      "We accept all major credit cards, PayPal, and bank transfers. We require a 20% deposit to begin work, with the remaining balance paid through flexible monthly installments based on your package.",
    "faq.q7": "Can I update the website myself after it's built?",
    "faq.a7":
      "Yes, all our websites come with user-friendly content management systems that allow you to make updates without technical knowledge. We also provide training on how to use the system.",
    "faq.q8": "Do you provide hosting services?",
    "faq.a8":
      "Yes, we offer reliable, high-performance hosting solutions optimised for the websites we build. Our hosting includes regular backups, security monitoring, and technical support.",

    // Contact page
    "contact.formTitle": "Send Us a Message",

    // Pricing page
    "pricing.title": "Simple, Transparent Pricing",
    "pricing.subtitle":
      "Your website is an investment in your business's future. Our AI-powered redesigns deliver real business results, with packages designed to fit businesses of all sizes.",
    "pricing.bestValue": "Best Value",
    "pricing.oneTime": "one-time",
    "pricing.included": "What's included",
    "pricing.notIncluded": "Not included",
    "pricing.guarantee": "100% Satisfaction Guarantee",
    "pricing.comparePlans": "Compare Plans",
    "pricing.features": "Features",
    "pricing.price": "Price",
    "pricing.pages": "Pages",
    "pricing.pagesCount.0": "5 pages",
    "pricing.pagesCount.1": "10 pages",
    "pricing.pagesCount.2": "15 pages",
    "pricing.seo": "SEO Optimization",
    "pricing.seoLevel.0": "Basic",
    "pricing.seoLevel.1": "Advanced",
    "pricing.seoLevel.2": "Advanced",
    "pricing.revisions": "Revision Rounds",
    "pricing.revisionsCount.0": "1",
    "pricing.revisionsCount.1": "2",
    "pricing.revisionsCount.2": "3",
    "pricing.ecommerce": "E-commerce",
    "pricing.animations": "Custom Animations",
    "pricing.support": "Support Period",
    "pricing.supportPeriod.0": "None",
    "pricing.supportPeriod.1": "1 month",
    "pricing.supportPeriod.2": "3 months",
    "pricing.delivery": "Delivery Time",
    "pricing.deliveryTime": "7 days",
    "pricing.faqTitle": "Frequently Asked Questions",
    "pricing.faqSubtitle":
      "Everything you need to know about our website redesign services.",
    "pricing.stillHaveQuestions": "Still have questions?",
    "pricing.faq.q1": "How does the 7-day delivery guarantee work?",
    "pricing.faq.a1":
      "Our streamlined process and AI-powered design tools allow us to deliver high-quality websites in just 7 days. The clock starts after we've completed the discovery phase and received all necessary content from you.",
    "pricing.faq.q2": "What if I need changes after the website is delivered?",
    "pricing.faq.a2":
      "Each package includes a specific number of revision rounds. Additional revisions can be purchased if needed. We're committed to ensuring you're completely satisfied with your new website.",
    "pricing.faq.q3": "Do you offer ongoing maintenance services?",
    "pricing.faq.a3":
      "Yes, we offer monthly maintenance packages to keep your website secure, up-to-date, and performing at its best. These can be added to any of our website packages.",
    "pricing.faq.q4": "Can I upgrade my package later?",
    "pricing.faq.a4":
      "Absolutely! You can upgrade to a higher-tier package at any time. We'll simply charge the difference in price and add the additional features to your website.",
    "pricing.faq.q5": "What payment methods do you accept?",
    "pricing.faq.a5":
      "We accept all major credit cards, PayPal, and bank transfers. We require a 20% deposit to begin work, with the remaining balance paid through flexible monthly installments based on your package.",
    "pricing.faq.q6": "Do you offer custom packages?",
    "pricing.faq.a6":
      "Yes, we can create custom packages tailored to your specific needs. Contact us to discuss your requirements and we'll provide a personalized quote.",
    "pricing.tier.basic.name": "Basic",
    "pricing.tier.standard.name": "Standard",
    "pricing.tier.premium.name": "Premium",
    "pricing.tier.basic.description":
      "Perfect for small businesses just getting started.",
    "pricing.tier.standard.description":
      "Our most popular package for established businesses.",
    "pricing.tier.premium.description":
      "For businesses needing a comprehensive online solution.",
    "pricing.tier.basic.cta": "Get Started",
    "pricing.tier.standard.cta": "Get Started",
    "pricing.tier.premium.cta": "Get Started",
    "pricing.calculator.title": "Calculate Your Cost",
    "pricing.calculator.subtitle": "How Much Will Your Website Redesign Cost?",
    "pricing.calculator.description":
      "Use our interactive calculator to get an instant estimate for your website redesign project.",

  },
  es: {
    // Navigation
    "nav.home": "Inicio",
    "nav.services": "Servicios",
    "nav.pricing": "Precios",
    "nav.about": "Nosotros",
    "nav.contact": "Contacto",
    "nav.login": "Iniciar sesión",
    "nav.signup": "Registrarse",
    "nav.dashboard": "Panel",

    // Common buttons
    "button.getStarted": "Comenzar",
    "button.learnMore": "Más información",
    "button.contactUs": "Contáctanos",
    "button.getFreeAudit": "Reserva tu llamada de consulta gratuita",

    // Hero section
    "hero.title": "Renueva tu sitio web. Impulsa tu negocio.",
    "hero.subtitle":
      "Rediseños de sitios web impulsados por IA para velocidad, conversión y crecimiento.",

    // Contact form
    "contact.title": "Contáctanos",
    "contact.subtitle":
      "¿Tienes una pregunta o estás listo para transformar tu sitio web? Estamos aquí para ayudarte.",
    "contact.name": "Nombre",
    "contact.email": "Correo electrónico",
    "contact.phone": "Teléfono",
    "contact.message": "Mensaje",
    "contact.submit": "Enviar mensaje",
    "contact.success": "¡Gracias! Tu mensaje ha sido enviado con éxito.",

    // FAQ section
    "faq.title": "Preguntas frecuentes",
    "faq.subtitle":
      "Encuentra respuestas a preguntas frecuentes sobre nuestros servicios.",
  },
  de: {
    // Navigation
    "nav.home": "Startseite",
    "nav.services": "Dienstleistungen",
    "nav.pricing": "Preise",
    "nav.about": "Über uns",
    "nav.contact": "Kontakt",
    "nav.login": "Anmelden",
    "nav.signup": "Registrieren",
    "nav.dashboard": "Dashboard",

    // Common buttons
    "button.getStarted": "Loslegen",
    "button.learnMore": "Mehr erfahren",
    "button.contactUs": "Kontaktieren Sie uns",
    "button.getFreeAudit": "Buchen Sie Ihren kostenlosen Beratungstermin",

    // Hero section
    "hero.title": "Erneuern Sie Ihre Website. Steigern Sie Ihr Geschäft.",
    "hero.subtitle":
      "KI-gestützte Website-Neugestaltungen für Geschwindigkeit, Konversion und Wachstum.",

    // Contact form
    "contact.title": "Kontakt aufnehmen",
    "contact.subtitle":
      "Haben Sie eine Frage oder sind Sie bereit, Ihre Website zu transformieren? Wir sind hier, um zu helfen.",
    "contact.name": "Name",
    "contact.email": "E-Mail",
    "contact.phone": "Telefon",
    "contact.message": "Nachricht",
    "contact.submit": "Nachricht senden",
    "contact.success":
      "Vielen Dank! Ihre Nachricht wurde erfolgreich gesendet.",

    // FAQ section
    "faq.title": "Häufig gestellte Fragen",
    "faq.subtitle":
      "Finden Sie Antworten auf häufig gestellte Fragen zu unseren Dienstleistungen.",
  },
  it: {
    // Navigation
    "nav.home": "Home",
    "nav.services": "Servizi",
    "nav.pricing": "Prezzi",
    "nav.about": "Chi siamo",
    "nav.contact": "Contatti",
    "nav.login": "Accedi",
    "nav.signup": "Registrati",
    "nav.dashboard": "Dashboard",

    // Common buttons
    "button.getStarted": "Inizia",
    "button.learnMore": "Scopri di più",
    "button.contactUs": "Contattaci",
    "button.getFreeAudit": "Prenota la tua chiamata di consulenza gratuita",

    // Hero section
    "hero.title": "Rinnova il tuo sito web. Potenzia la tua attività.",
    "hero.subtitle":
      "Riprogettazioni di siti web basate su IA per velocità, conversione e crescita.",

    // Contact form
    "contact.title": "Mettiti in contatto",
    "contact.subtitle":
      "Hai una domanda o sei pronto a trasformare il tuo sito web? Siamo qui per aiutarti.",
    "contact.name": "Nome",
    "contact.email": "Email",
    "contact.phone": "Telefono",
    "contact.message": "Messaggio",
    "contact.submit": "Invia messaggio",
    "contact.success": "Grazie! Il tuo messaggio è stato inviato con successo.",

    // FAQ section
    "faq.title": "Domande frequenti",
    "faq.subtitle": "Trova risposte alle domande frequenti sui nostri servizi.",
  },
  zh: {
    // Navigation
    "nav.home": "首页",
    "nav.services": "服务",
    "nav.pricing": "价格",
    "nav.about": "关于我们",
    "nav.contact": "联系我们",
    "nav.login": "登录",
    "nav.signup": "注册",
    "nav.dashboard": "控制面板",

    // Common buttons
    "button.getStarted": "开始使用",
    "button.learnMore": "了解更多",
    "button.contactUs": "联系我们",
    "button.getFreeAudit": "预约您的免费咨询电话",

    // Hero section
    "hero.title": "改造您的网站。提升您的业务。",
    "hero.subtitle": "AI驱动的网站重新设计，为速度、转化和增长而构建。",

    // Contact form
    "contact.title": "联系我们",
    "contact.subtitle": "有问题或准备好改造您的网站？我们随时为您提供帮助。",
    "contact.name": "姓名",
    "contact.email": "电子邮件",
    "contact.phone": "电话",
    "contact.message": "留言",
    "contact.submit": "发送消息",
    "contact.success": "谢谢！您的消息已成功发送。",

    // FAQ section
    "faq.title": "常见问题",
    "faq.subtitle": "查找有关我们服务的常见问题解答。",
  },
};

// Current language
let currentLanguage = "en";

/**
 * Set the current language
 * @param lang - The language code to set
 */
export function setLanguage(lang: string): void {
  if (translations[lang]) {
    currentLanguage = lang;
    // Store language preference
    localStorage.setItem("language", lang);
    // Dispatch event for components to update
    window.dispatchEvent(new Event("languagechange"));
  }
}

/**
 * Get the current language
 * @returns The current language code
 */
export function getLanguage(): string {
  return currentLanguage;
}

/**
 * Initialize language from localStorage or browser settings
 */
export function initLanguage(): void {
  // Check localStorage first
  const storedLang = localStorage.getItem("language");
  if (storedLang && translations[storedLang]) {
    currentLanguage = storedLang;
    return;
  }

  // Check browser language
  const browserLang = navigator.language.split("-")[0];
  if (translations[browserLang]) {
    currentLanguage = browserLang;
  }
}

/**
 * Translate a key to the current language
 * @param key - The translation key
 * @param fallback - Optional fallback if key is not found
 * @returns The translated string
 */
export function t(key: string, fallback?: string): string {
  if (translations[currentLanguage] && translations[currentLanguage][key]) {
    return translations[currentLanguage][key];
  }

  // Try English as fallback
  if (
    currentLanguage !== "en" &&
    translations["en"] &&
    translations["en"][key]
  ) {
    return translations["en"][key];
  }

  // Return fallback or key itself
  return fallback || key;
}

// Initialize language on load
initLanguage();

// Listen for language changes and update all components
window.addEventListener("languagechange", () => {
  // Force a re-render of components by dispatching a custom event
  document.dispatchEvent(new Event("languageChanged"));
});
