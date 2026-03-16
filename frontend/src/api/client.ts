import axios from 'axios';

// Use env var or fallback to localhost for local dev
const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

export const apiClient = axios.create({
    baseURL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add response interceptor for global error handling if needed
apiClient.interceptors.response.use(
    (response) => response,
    (error) => {
        console.error('API Error:', error.response?.data || error.message);
    }
);

import { EventListResponse, EventDetail, VisualsPayload, DarkFlightPayload } from '../types';

export const api = {
    getEvents: (params?: any) => apiClient.get<EventListResponse>('/events', { params }).then(res => res.data),
    getEvent: (id: number) => apiClient.get<EventDetail>(`/events/${id}`).then(res => res.data),
    
    getEventVisuals: (id: number) => apiClient.get<VisualsPayload>(`/events/${id}/visuals`).then(res => res.data),
    getDarkFlight: (id: number) => apiClient.get<DarkFlightPayload>(`/events/${id}/dark-flight`).then(res => res.data),
    compareEvents: (ids: number[]) => apiClient.get<EventDetail[]>(`/compare`, { params: { event_ids: ids.join(',') } }).then(res => res.data),
    
    triggerReconstruction: (id: number) => apiClient.post(`/jobs/reconstruct/${id}`).then(res => res.data),
    triggerNasaIngest: (data: { start_date: string, end_date: string }) => apiClient.post(`/jobs/ingest/nasa`, data).then(res => res.data),
    triggerAmsManualPoll: () => apiClient.post(`/jobs/ingest/ams`).then(res => res.data),
    
    getLiveFeed: (limit = 15) => apiClient.get<any[]>(`/live-feed`, { params: { limit } }).then(res => res.data),
    getLiveFeedStatus: () => apiClient.get(`/live-feed/status`).then(res => res.data),
};
