import { useEffect } from "react";

const SITE_NAME = "The Enclosure";

const DEFAULT_TITLE = `${SITE_NAME} | Websites that win UK enquiries`;
const DEFAULT_DESCRIPTION =
  "We build websites for UK businesses that need more enquiries, stronger local search, and a site that looks the part.";

function ensureDescriptionMeta(): HTMLMetaElement {
  let metaEl = document.querySelector('meta[name="description"]');
  if (!metaEl) {
    metaEl = document.createElement("meta");
    metaEl.setAttribute("name", "description");
    document.head.appendChild(metaEl);
  }
  return metaEl as HTMLMetaElement;
}

/**
 * Sets document.title to "Page | The Enclosure" (or the home default).
 * Optionally sets meta name="description".
 * Uses a pipe separator (no em dash).
 */
export function useDocumentTitle(pageTitle?: string, description?: string) {
  useEffect(() => {
    const previousTitle = document.title;
    const resolvedDescription = description ?? (pageTitle ? undefined : DEFAULT_DESCRIPTION);
    const metaEl = resolvedDescription ? ensureDescriptionMeta() : null;
    const previousDescription = metaEl?.getAttribute("content") ?? null;

    document.title = pageTitle ? `${pageTitle} | ${SITE_NAME}` : DEFAULT_TITLE;
    if (metaEl && resolvedDescription) {
      metaEl.setAttribute("content", resolvedDescription);
    }

    return () => {
      document.title = previousTitle;
      if (metaEl && previousDescription !== null) {
        metaEl.setAttribute("content", previousDescription);
      }
    };
  }, [pageTitle, description]);
}
