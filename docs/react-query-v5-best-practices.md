# React Query (TanStack Query) v5 - Best Practices Guide

## 1. QueryClient Configuration

**Optimal staleTime & gcTime (garbage collection):**

```javascript
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,        // 5 minutes: data fresh, no refetch
      gcTime: 1000 * 60 * 10,          // 10 minutes: cache retention (v5 renamed cacheTime→gcTime)
      retry: 3,
      retryDelay: attempt =>
        Math.min(attempt > 1 ? 2 ** attempt * 1000 : 1000, 30 * 1000), // exponential backoff
      refetchOnWindowFocus: true,
      refetchOnReconnect: 'stale',
      refetchOnMount: 'stale',
    },
    mutations: {
      retry: 1,
      retryDelay: 1000,
    }
  }
})
```

**Key Defaults Changed in v5:**
- `cacheTime` → `gcTime` (controls inactive query cleanup, default 5 min)
- `staleTime` (controls staleness period, default 0 = always stale)
- Status renamed: `loading` → `isPending`, new `isLoading` flag = `isPending && isFetching`

## 2. JWT Authentication with Token Refresh

**Axios Interceptor Pattern (Recommended):**

```javascript
// api/axios-instance.js
import axios from 'axios'
import { useAuthStore } from './auth-store'

const API = axios.create({
  baseURL: process.env.REACT_APP_API_URL,
})

// Request interceptor: attach access token
API.interceptors.request.use(config => {
  const token = useAuthStore.getState().accessToken
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
}, error => Promise.reject(error))

// Response interceptor: handle 401 & refresh token
API.interceptors.response.use(
  response => response,
  async error => {
    const originalRequest = error.config
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true
      try {
        const { accessToken } = await useAuthStore.getState().refreshToken()
        originalRequest.headers.Authorization = `Bearer ${accessToken}`
        return API(originalRequest)
      } catch (refreshError) {
        // Redirect to login on refresh failure
        useAuthStore.getState().logout()
        return Promise.reject(refreshError)
      }
    }
    return Promise.reject(error)
  }
)

export default API
```

**Use with React Query:**
```javascript
const { mutate: refreshToken } = useMutation({
  mutationFn: authService.refreshToken,
  onSuccess: (data) => {
    // Store tokens & invalidate stale queries
    setTokens(data)
    queryClient.invalidateQueries({ queryKey: ['user'] })
  },
})
```

## 3. Error Handling & Retry Logic

**Custom Retry Function:**

```javascript
const useSmartRetry = {
  retry: (failureCount, error) => {
    // Don't retry 4xx errors (except 408/429)
    if (error.response?.status >= 400 && error.response?.status < 500) {
      if (![408, 429].includes(error.response.status)) {
        return false
      }
    }
    return failureCount < 3 // retry max 3 times
  },
  retryDelay: attemptIndex =>
    Math.min(1000 * 2 ** attemptIndex, 30000), // exponential backoff, max 30s
}
```

**Global Error Handling:**
```javascript
// Centralize error formatting
const useQuery = (options) => {
  return useTanStackQuery({
    ...options,
    retry: useSmartRetry.retry,
    retryDelay: useSmartRetry.retryDelay,
  })
}
```

## 4. File Upload with multipart/form-data

**useMutation Pattern:**

```javascript
const useFileUpload = () => {
  return useMutation({
    mutationFn: async (file) => {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('type', 'avatar')

      return API.post('/api/user/avatar', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
    },
    onSuccess: (data) => {
      // Invalidate profile query to refetch updated avatar
      queryClient.invalidateQueries({ queryKey: ['user', 'profile'] })
    },
  })
}
```

**Key Rules:**
- FormData auto-sets `Content-Type` with boundary; explicit header can cause issues
- Append file LAST after other fields (some backends require order)
- Don't set contentType with fetch; let browser handle it

## 5. Pagination Patterns

**Cursor-Based (Recommended for APIs):**

```javascript
const useArticlesList = (pageParam = null) => {
  return useInfiniteQuery({
    queryKey: ['articles'],
    queryFn: ({ pageParam }) =>
      API.get('/api/articles', { params: { cursor: pageParam } }),
    initialPageParam: null,
    getNextPageParam: (lastPage) => lastPage.data.nextCursor, // null when no more
    getPreviousPageParam: (firstPage) => firstPage.data.prevCursor,
  })
}

// Usage with infinite scroll
const { data, fetchNextPage, hasNextPage, isFetchingNextPage } = useArticlesList()

return (
  <>
    {data?.pages.map(page =>
      page.data.items.map(item => <ArticleCard key={item.id} item={item} />)
    )}
    <button
      onClick={() => fetchNextPage()}
      disabled={!hasNextPage || isFetchingNextPage}
    >
      {isFetchingNextPage ? 'Loading...' : 'Load More'}
    </button>
  </>
)
```

**Page-Based Alternative:**

```javascript
const [pageIndex, setPageIndex] = useState(0)

const { data } = useQuery({
  queryKey: ['articles', pageIndex],
  queryFn: () => API.get(`/api/articles?page=${pageIndex}&limit=10`),
})
```

## 6. Axios Integration with React Query

**Recommended Setup:**
```javascript
// queryClient.ts
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: ({ queryKey }) => API.get(`${queryKey[0]}`).then(r => r.data),
    }
  }
})

// Usage: automatically uses API interceptor for auth & error handling
const { data } = useQuery({ queryKey: ['user/profile'] })
```

## 7. DevTools Setup

**Installation & Basic Setup:**

```bash
npm install @tanstack/react-query-devtools
```

```javascript
// App.jsx - floating mode (default)
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppContent />
      <ReactQueryDevtools
        initialIsOpen={false}
        buttonPosition="bottom-right"
      />
    </QueryClientProvider>
  )
}
```

**Browser Extension:** Install "TanStack Query DevTools" from Chrome/Firefox store for DevTools tab integration.

**Features:**
- Real-time query/mutation status visualization
- Cache inspection & manual invalidation
- Request/response debugging
- Removed in production (via `process.env.NODE_ENV` check)

## 8. Cache Invalidation After Mutations

**Core Pattern:**

```javascript
const useCreateArticle = () => {
  return useMutation({
    mutationFn: (data) => API.post('/api/articles', data),
    onSuccess: (newArticle) => {
      // Strategy 1: Invalidate entire list
      queryClient.invalidateQueries({ queryKey: ['articles'] })

      // Strategy 2: Manually update cache (risky, use only when necessary)
      queryClient.setQueryData(['articles'], (old) => ({
        ...old,
        items: [newArticle, ...old.items]
      }))
    }
  })
}
```

**Best Practices:**
1. **Invalidate > Manual Updates:** Invalidation is safer; let backend be source of truth
2. **Use exact false:** Invalidate related queries with broad matching
   ```javascript
   queryClient.invalidateQueries({
     queryKey: ['articles'],
     exact: false // also invalidates articles/1, articles/search, etc.
   })
   ```
3. **Global Mutation Callbacks (v5):** Apply invalidation logic centrally
   ```javascript
   const mutationCache = new MutationCache({
     onSuccess: () => {
       queryClient.invalidateQueries({ queryKey: ['articles'] })
     }
   })
   ```

## Summary: Integration Checklist for htravel Project

✅ **Frontend with React Query v5:**
- [ ] Set up QueryClient with 5-min staleTime, 10-min gcTime
- [ ] Implement JWT refresh via axios interceptors (401 handling)
- [ ] Configure exponential backoff (3 retries, max 30s delay)
- [ ] Use useMutation + FormData for avatar/image uploads
- [ ] Implement useInfiniteQuery for articles & places list
- [ ] Add ReactQueryDevtools for dev debugging
- [ ] Invalidate queries after mutations (e.g., after creating article)
- [ ] Handle file uploads with proper Content-Type headers

## References

- [TanStack Query v5 Docs](https://tanstack.com/query/v5/docs/framework/react/overview)
- [Important Defaults](https://tanstack.com/query/v5/docs/react/guides/important-defaults)
- [Query Options](https://tanstack.com/query/v5/docs/framework/react/guides/query-options)
- [Infinite Queries](https://tanstack.com/query/latest/docs/framework/react/guides/infinite-queries)
- [Invalidations from Mutations](https://tanstack.com/query/v5/docs/react/guides/invalidations-from-mutations)
- [TkDodo's Blog - Mastering Mutations](https://tkdodo.eu/blog/mastering-mutations-in-react-query)
- [JWT + Axios Interceptors Guide](https://codevoweb.com/react-query-context-api-axios-interceptors-jwt-auth/)
- [DevTools Documentation](https://tanstack.com/query/v5/docs/react/devtools)
