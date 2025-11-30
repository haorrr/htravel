# React Query v5 Best Practices - Research Summary

**Research Date:** 2025-11-30
**Sources:** TanStack Official Docs, GitHub, Medium, DEV Community
**Target:** htravel Project Frontend Integration

---

## Executive Summary

React Query (TanStack Query) v5 is a robust data-fetching library that manages server state with automatic caching, synchronization, and garbage collection. Key v5 changes: `cacheTime` → `gcTime`, status `loading` → `isPending`, and enhanced Suspense support.

---

## 1. QueryClient Configuration (Optimal Settings)

| Setting | Default | Recommendation | Rationale |
|---------|---------|-----------------|-----------|
| `staleTime` | 0 | 5 min (300000ms) | Avoid refetch within 5min window; users see fresh data |
| `gcTime` | 5 min | 10 min (600000ms) | Keep cached data longer for offline support; was `cacheTime` in v4 |
| `retry` | 3 | 3 | Good default; custom via `retry = (count, error) => {}` |
| `retryDelay` | exponential | `Math.min(2^attempt * 1000, 30000)` | Exponential backoff prevents server overload |
| `refetchOnWindowFocus` | true | true | Re-sync on tab focus; set false for non-critical data |

**Code Example:**
```javascript
new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,        // 5 min
      gcTime: 1000 * 60 * 10,          // 10 min
      retry: 3,
      retryDelay: attemptIndex =>
        Math.min(1000 * 2 ** attemptIndex, 30000),
      refetchOnReconnect: 'stale',
      refetchOnMount: 'stale',
    }
  }
})
```

---

## 2. JWT Authentication & Token Refresh

**Best Pattern:** Axios request/response interceptors + React Query mutations

```javascript
// Request: Add token to all requests
API.interceptors.request.use(config => {
  config.headers.Authorization = `Bearer ${getAccessToken()}`
  return config
})

// Response: Handle 401 → refresh token → retry
API.interceptors.response.use(
  res => res,
  async error => {
    if (error.response?.status === 401 && !error.config._retry) {
      error.config._retry = true
      const newToken = await refreshTokenAPI()
      error.config.headers.Authorization = `Bearer ${newToken}`
      return API(error.config) // Retry original request
    }
    return Promise.reject(error)
  }
)
```

**Security Note:** Store tokens in HTTPOnly cookies if possible; otherwise, implement token revocation on 401.

**Source:** [JWT + Axios Guide](https://codevoweb.com/react-query-context-api-axios-interceptors-jwt-auth/)

---

## 3. Error Handling & Retry Logic

**Default Behavior:**
- Retries 3 times automatically
- Exponential backoff: 1s → 2s → 4s (capped at 30s)
- 4xx errors (except 408/429) → no retry
- Network errors → retry with backoff

**Custom Retry Logic:**
```javascript
const smartRetry = {
  retry: (failCount, error) => {
    if (error.response?.status >= 400 && ![408, 429].includes(error.response.status)) {
      return false // Don't retry 4xx except timeout/rate-limit
    }
    return failCount < 3
  },
  retryDelay: attempt => Math.min(1000 * 2 ** attempt, 30000)
}

useQuery({ queryKey, queryFn, ...smartRetry })
```

**Source:** [Query Retries Guide](https://tanstack.com/query/v4/docs/framework/react/guides/query-retries)

---

## 4. File Upload (multipart/form-data)

**Pattern: useMutation + FormData**

```javascript
const useUploadAvatar = () => useMutation({
  mutationFn: async (file) => {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('type', 'avatar')

    return API.post('/api/user/avatar', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
      // OR: omit header, let browser set it
    })
  },
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['user'] })
  }
})
```

**Critical Rules:**
- Don't manually set `Content-Type: multipart/form-data`; browser handles boundary
- Append file LAST (some backends require field order)
- Use FormData, not JSON; axios auto-detects FormData

**Source:** [Multipart Upload Patterns](https://refine.dev/blog/how-to-multipart-file-upload-with-react-hook-form/)

---

## 5. Pagination (Cursor vs Offset)

**Recommended: Cursor-Based (useInfiniteQuery)**

```javascript
const useArticles = () => useInfiniteQuery({
  queryKey: ['articles'],
  queryFn: ({ pageParam }) =>
    API.get('/api/articles', { params: { cursor: pageParam } }),
  initialPageParam: null,
  getNextPageParam: lastPage => lastPage.nextCursor || undefined,
  getPreviousPageParam: firstPage => firstPage.prevCursor || undefined,
})

// Usage
const { data, fetchNextPage, hasNextPage, isFetchingNextPage } = useArticles()
data?.pages.forEach(page => page.items.forEach(item => /* render */))
```

**Fallback: Offset-Based**
```javascript
const [page, setPage] = useState(1)
useQuery({
  queryKey: ['articles', page],
  queryFn: () => API.get(`/api/articles?page=${page}&limit=10`)
})
```

**Source:** [Infinite Queries](https://tanstack.com/query/latest/docs/framework/react/guides/infinite-queries)

---

## 6. Axios Interceptors Integration

**Setup:**
```javascript
// Create axios instance with defaults
export const API = axios.create({
  baseURL: process.env.REACT_APP_API_URL,
  timeout: 10000,
})

// React Query uses this globally
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: ({ queryKey }) => API.get(queryKey[0]).then(r => r.data)
    }
  }
})
```

**Benefits:**
- Centralized token refresh logic
- Global error handling
- Automatic retry via React Query
- No per-query configuration needed

---

## 7. DevTools Setup

**Installation:**
```bash
npm install @tanstack/react-query-devtools
```

**Integration:**
```javascript
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Routes />
      <ReactQueryDevtools
        initialIsOpen={false}
        buttonPosition="bottom-right"
      />
    </QueryClientProvider>
  )
}
```

**Features:**
- Visual query/mutation status
- Cache inspection & manual invalidation
- Timeline of requests
- Automatic removal in production (via NODE_ENV check)

**Browser Extension:** Install "TanStack Query DevTools" Chrome extension for DevTools panel.

**Source:** [DevTools Guide](https://tanstack.com/query/v5/docs/react/devtools)

---

## 8. Cache Invalidation Strategies

**Strategy 1: Invalidate After Mutations (RECOMMENDED)**
```javascript
useMutation({
  mutationFn: createArticle,
  onSuccess: () => {
    // Invalidate all articles-related queries
    queryClient.invalidateQueries({ queryKey: ['articles'], exact: false })
  }
})
```

**Strategy 2: Manual Cache Update (Use Sparingly)**
```javascript
onSuccess: (newItem) => {
  queryClient.setQueryData(['articles'], old => ({
    ...old,
    items: [newItem, ...old.items]
  }))
}
```

**Best Practices:**
1. **Prefer invalidation** over manual updates (safer, lets backend be source of truth)
2. **Use `exact: false`** to catch related queries (e.g., ['articles/search'], ['articles', userId])
3. **Global mutation callbacks** for consistent behavior
4. **Avoid overly generic keys** that match unrelated queries

**Source:** [Invalidations from Mutations](https://tanstack.com/query/v5/docs/react/guides/invalidations-from-mutations), [TkDodo's Blog](https://tkdodo.eu/blog/mastering-mutations-in-react-query)

---

## Checklist for htravel Frontend

- [ ] **QueryClient Config:** staleTime=5min, gcTime=10min, exponential retry
- [ ] **JWT Auth:** Axios interceptors for 401 → token refresh → retry
- [ ] **Error Handling:** Smart retry (skip 4xx), exponential backoff
- [ ] **File Uploads:** useMutation + FormData for avatars/images (Phase 03, 04)
- [ ] **Pagination:** useInfiniteQuery for articles (Phase 06) & places (Phase 08)
- [ ] **Axios Setup:** Global instance with queryClient default queryFn
- [ ] **DevTools:** ReactQueryDevtools in App.jsx for dev debugging
- [ ] **Cache Invalidation:** Invalidate after every mutation (CREATE, UPDATE, DELETE)

---

## Key Resources

| Resource | Purpose |
|----------|---------|
| [TanStack Query v5 Overview](https://tanstack.com/query/v5/docs/framework/react/overview) | Official reference |
| [Important Defaults](https://tanstack.com/query/v5/docs/react/guides/important-defaults) | Config best practices |
| [Infinite Queries](https://tanstack.com/query/latest/docs/framework/react/guides/infinite-queries) | Pagination patterns |
| [TkDodo's Blog](https://tkdodo.eu/blog/mastering-mutations-in-react-query) | Advanced patterns |
| [DevTools Guide](https://tanstack.com/query/v5/docs/react/devtools) | Development tools |

---

## Unresolved Questions

- Which token storage approach is implemented in htravel backend? (HTTPOnly cookies vs localStorage)
- Are there any custom query key conventions established in the htravel codebase?
- Should pagination use cursor-based or offset-based approach for htravel APIs?
