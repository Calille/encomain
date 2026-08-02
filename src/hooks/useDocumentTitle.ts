import { useEffect } from "react";

const SITE_NAME = "The Enclosure";
const SITE_ORIGIN = "https://theenclosure.co.uk";

const DEFAULT_TITLE = `${SITE_NAME} | Websites that win UK enquiries`;
const DEFAULT_DESCRIPTION =
  "We build websites for UK businesses that need more enquiries, stronger local search, and a site that looks the part.";

function ensureMeta(selector: string, attribute: string, attributeValue: string): HTMLMetaElement {
  let metaEl = document.querySelector(selector);
  if (!metaEl) {
    metaEl = document.createElement("meta");
    metaEl.setAttribute(attribute, attributeValue);
    document.head.appendChild(metaEl);
  }
  return metaEl as HTMLMetaElement;
}

function setMetaContent(metaEl: HTMLMetaElement, content: string) {
  metaEl.setAttribute("content", content);
}

/**
 * Sets document.title to "Page | The Enclosure" (or the home default),
 * meta description, and Open Graph / Twitter card tags for the current route.
 * Uses a pipe separator (no em dash).
 */
export function useDocumentTitle(pageTitle?: string, description?: string) {
  useEffect(() => {
    const previousTitle = document.title;
    const title = pageTitle ? `${pageTitle} | ${SITE_NAME}` : DEFAULT_TITLE;
    const resolvedDescription = description ?? (pageTitle ? undefined : DEFAULT_DESCRIPTION);
    const canonicalUrl = `${SITE_ORIGIN}${window.location.pathname === "/" ? "" : window.location.pathname}`;

    const descriptionMeta = resolvedDescription
      ? ensureMeta('meta[name="description"]', "name", "description")
      : null;
    const previousDescription = descriptionMeta?.getAttribute("content") ?? null;

    const ogTitle = ensureMeta('meta[property="og:title"]', "property", "og:title");
    const ogDescription = ensureMeta('meta[property="og:description"]', "property", "og:description");
    const ogUrl = ensureMeta('meta[property="og:url"]', "property", "og:url");
    const twitterTitle = ensureMeta('meta[name="twitter:title"]', "name", "twitter:title");
    const twitterDescription = ensureMeta(
      'meta[name="twitter:description"]',
      "name",
      "twitter:description"
    );

    const previousOgTitle = ogTitle.getAttribute("content");
    const previousOgDescription = ogDescription.getAttribute("content");
    const previousOgUrl = ogUrl.getAttribute("content");
    const previousTwitterTitle = twitterTitle.getAttribute("content");
    const previousTwitterDescription = twitterDescription.getAttribute("content");

    document.title = title;
    setMetaContent(ogTitle, title);
    setMetaContent(ogUrl, canonicalUrl);
    setMetaContent(twitterTitle, title);

    if (descriptionMeta && resolvedDescription) {
      setMetaContent(descriptionMeta, resolvedDescription);
      setMetaContent(ogDescription, resolvedDescription);
      setMetaContent(twitterDescription, resolvedDescription);
    }

    return () => {
      document.title = previousTitle;
      if (descriptionMeta && previousDescription !== null) {
        setMetaContent(descriptionMeta, previousDescription);
      }
      if (previousOgTitle !== null) setMetaContent(ogTitle, previousOgTitle);
      if (previousOgDescription !== null) setMetaContent(ogDescription, previousOgDescription);
      if (previousOgUrl !== null) setMetaContent(ogUrl, previousOgUrl);
      if (previousTwitterTitle !== null) setMetaContent(twitterTitle, previousTwitterTitle);
      if (previousTwitterDescription !== null) {
        setMetaContent(twitterDescription, previousTwitterDescription);
      }
    };
  }, [pageTitle, description]);
}
