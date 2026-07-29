/**
 * Funil da LP: page_view, section_view e buy_click (+ legados ebook/news).
 *
 * Os eventos iam para o backend Express aposentado na Render, que gravava
 * numa MySQL que ninguém lia. Agora vão para a tabela `landing_events` no
 * Supabase (migration 0024): a anon key só consegue INSERT (RLS) e o /admin
 * da plataforma lê o funil via service role. O histórico anterior (~7,8 mil
 * eventos até 2026-07-28) permanece na MySQL da Render.
 */

const SESSION_KEY = 'analytics_session_id';

// crypto.randomUUID só existe em contexto seguro (https/localhost); o
// prerender e ambientes de teste rodam fora disso.
function novoSessionId(): string {
  try {
    return crypto.randomUUID();
  } catch {
    return `s-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
  }
}

// Get or create session ID
export function getSessionId(): string {
  let sessionId = localStorage.getItem(SESSION_KEY);

  if (!sessionId) {
    sessionId = novoSessionId();
    localStorage.setItem(SESSION_KEY, sessionId);
  }

  return sessionId;
}

// Event types
export type EventType =
  | 'page_view'
  | 'section_view'
  | 'ebook_download'
  | 'newsletter_subscribe'
  | 'buy_click';

// Track analytics event
export async function trackEvent(
  eventType: EventType,
  data?: {
    pageUrl?: string;
    sectionName?: string;
  }
): Promise<void> {
  try {
    const url = import.meta.env.VITE_SUPABASE_URL;
    const anon = import.meta.env.VITE_SUPABASE_ANON_KEY;
    if (!url || !anon) return;

    await fetch(`${url}/rest/v1/landing_events`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        apikey: anon,
        Authorization: `Bearer ${anon}`,
        Prefer: 'return=minimal',
      },
      body: JSON.stringify({
        event_type: eventType,
        session_id: getSessionId(),
        page_url: data?.pageUrl || window.location.pathname,
        section_name: data?.sectionName ?? null,
      }),
    });
  } catch (error) {
    // Silently fail - don't break user experience if analytics fails
    console.debug('Analytics tracking failed:', error);
  }
}

// Track page view
export function trackPageView(): void {
  trackEvent('page_view', {
    pageUrl: window.location.pathname,
  });
}

// Track section view (using IntersectionObserver)
export function observeSection(element: HTMLElement, sectionName: string): () => void {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting && entry.intersectionRatio >= 0.5) {
          trackEvent('section_view', {
            sectionName,
          });
          // Unobserve after first trigger
          observer.unobserve(element);
        }
      });
    },
    {
      threshold: 0.5, // Trigger when 50% visible
    }
  );

  observer.observe(element);

  // Return cleanup function
  return () => observer.disconnect();
}

// Track buy button click
export function trackBuyClick(): void {
  trackEvent('buy_click');
}

// Track ebook download
export function trackEbookDownload(): void {
  trackEvent('ebook_download');
}

// Track newsletter subscription
export function trackNewsletterSubscribe(): void {
  trackEvent('newsletter_subscribe');
}
