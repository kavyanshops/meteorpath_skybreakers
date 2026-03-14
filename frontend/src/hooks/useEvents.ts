import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../api/client';
import { EventListResponse } from '../types';

export interface UseEventsParams {
    page?: number;
    pageSize?: number;
    startDate?: string | null;
    endDate?: string | null;
    network?: string | null;
    region?: string | null;
    minVelocity?: number | null;
    maxVelocity?: number | null;
    showerCode?: string | null;
    search?: string | null;
}

export const useEvents = (params: UseEventsParams) => {
    return useQuery({
        queryKey: ['events', params],
        queryFn: async () => {
            // Clean up empty params
            const cleanParams = Object.fromEntries(
                Object.entries({
                    page: params.page,
                    page_size: params.pageSize,
                    start_date: params.startDate,
                    end_date: params.endDate,
                    network: params.network,
                    region: params.region,
                    min_velocity: params.minVelocity,
                    max_velocity: params.maxVelocity,
                    shower_code: params.showerCode,
                    search: params.search,
                }).filter(([_, v]) => v != null && v !== '')
            );

            const { data } = await apiClient.get<EventListResponse>('/events', {
                params: cleanParams,
            });
            return data;
        },
        staleTime: 1000 * 60 * 5, // Data is fresh for 5 minutes
    });
};
