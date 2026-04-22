import { useEffect, useState, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { usePolisConfig } from '../providers/PolisProvider.js';

export type RealtimeStatus = 'connecting' | 'open' | 'closed';

export interface UseRealtimeResult {
  status: RealtimeStatus;
  lastEvent: string | null;
}

export function useRealtime(channel: string): UseRealtimeResult {
  const config = usePolisConfig();
  const queryClient = useQueryClient();
  const [status, setStatus] = useState<RealtimeStatus>('connecting');
  const [lastEvent, setLastEvent] = useState<string | null>(null);
  const eventSourceRef = useRef<EventSource | null>(null);

  useEffect(() => {
    const url = `${config.bffUrl}/stream/${channel}`;
    const es = new EventSource(url);
    eventSourceRef.current = es;

    es.onopen = () => setStatus('open');
    es.onerror = () => setStatus('closed');

    es.addEventListener('post_created', (event) => {
      setLastEvent(event.data);
      queryClient.invalidateQueries({ queryKey: ['polis', 'topic'] });
    });

    es.addEventListener('topic_created', (event) => {
      setLastEvent(event.data);
      queryClient.invalidateQueries({ queryKey: ['polis', 'topics'] });
      queryClient.invalidateQueries({ queryKey: ['polis', 'categories'] });
    });

    return () => {
      es.close();
      eventSourceRef.current = null;
      setStatus('closed');
    };
  }, [channel, config.bffUrl, queryClient]);

  return { status, lastEvent };
}
