import { useState, useEffect } from "react";

/**
 * 미디어 쿼리를 감시하고 일치 여부를 반환하는 커스텀 훅
 * @param query 미디어 쿼리 문자열 (예: "(max-width: 1024px)")
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const media = window.matchMedia(query);
    if (media.matches !== matches) {
      setMatches(media.matches);
    }

    const listener = () => setMatches(media.matches);
    media.addEventListener("change", listener);
    
    return () => media.removeEventListener("change", listener);
  }, [matches, query]);

  return matches;
}
