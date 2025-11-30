import { useQuery } from '@tanstack/react-query';
import { placesService } from '../services/places';

// Query keys
export const placesKeys = {
  all: ['places'],
  search: (params) => [...placesKeys.all, 'search', params],
  nearby: (params) => [...placesKeys.all, 'nearby', params],
  details: (placeId) => [...placesKeys.all, 'details', placeId],
  types: () => [...placesKeys.all, 'types'],
  status: () => [...placesKeys.all, 'status'],
};

/**
 * Search places by query
 */
export const useSearchPlaces = (query, options = {}) => {
  const { lat, lng, radius, type } = options;

  return useQuery({
    queryKey: placesKeys.search({ query, lat, lng, radius, type }),
    queryFn: () => placesService.searchPlaces(query, lat, lng, radius, type),
    enabled: !!query && query.length >= 2,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};

/**
 * Search nearby places
 */
export const useNearbyPlaces = (lat, lng, options = {}) => {
  const { radius, type, keyword } = options;

  return useQuery({
    queryKey: placesKeys.nearby({ lat, lng, radius, type, keyword }),
    queryFn: () => placesService.nearbyPlaces(lat, lng, radius, type, keyword),
    enabled: !!lat && !!lng,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

/**
 * Get place details by ID
 */
export const usePlaceDetails = (placeId) => {
  return useQuery({
    queryKey: placesKeys.details(placeId),
    queryFn: () => placesService.getPlaceDetails(placeId),
    enabled: !!placeId,
    staleTime: 15 * 60 * 1000, // 15 minutes (place details rarely change)
  });
};

/**
 * Get available place types
 */
export const usePlaceTypes = () => {
  return useQuery({
    queryKey: placesKeys.types(),
    queryFn: placesService.getPlaceTypes,
    staleTime: 60 * 60 * 1000, // 1 hour (types never change)
  });
};

/**
 * Get Places API status
 */
export const usePlacesStatus = () => {
  return useQuery({
    queryKey: placesKeys.status(),
    queryFn: placesService.getStatus,
    staleTime: 10 * 60 * 1000,
    retry: 2,
  });
};
