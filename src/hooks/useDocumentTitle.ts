import { useEffect } from "react";

const SITE_NAME = "The Enclosure";

/**
 * Sets document.title to "Page | The Enclosure".
 * Uses a pipe separator (no em dash).
 */
export function useDocumentTitle(pageTitle?: string) {
  useEffect(() => {
    const previous = document.title;
    document.title = pageTitle ? `${pageTitle} | ${SITE_NAME}` : `${SITE_NAME} | Web design and lead generation`;
    return () => {
      document.title = previous;
    };
  }, [pageTitle]);
}
