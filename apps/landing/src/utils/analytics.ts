import { API_URL } from './api';

const SESSION_KEY = 'analytics_session_id';

// Get or create session ID
export function getSessionId(): string {
  let sessionId = localStorage.getItem(SESSION_KEY);

  if (!sessionId) {
    sessionId = crypto.randomUUID();
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
    const sessionId = getSessionId();

    await fetch(`${API_URL}/api/analytics/event`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        event_type: eventType,
        session_id: sessionId,
        page_url: data?.pageUrl || window.location.pathname,
        section_name: data?.sectionName,
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
