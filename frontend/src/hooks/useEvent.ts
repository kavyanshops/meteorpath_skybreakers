import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../api/client';
import { EventDetail } from '../types';

export const useEvent = (eventId: string | undefined) => {
    return useQuery({
        queryKey: ['event', eventId],
        queryFn: async () => {
            if (!eventId) throw new Error('Event ID is required');
            const { data } = await apiClient.get<EventDetail>(`/events/${eventId}`);
            return data;
        },
        enabled: !!eventId, // Only run the query if eventId exists
        staleTime: 1000 * 60 * 5,
    });
};
