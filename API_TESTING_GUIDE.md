# Testing the Improved Posts API

## Test the New API Endpoints

### 1. Basic Posts Retrieval

```bash
# Get first page with default settings
curl -X GET "http://localhost:5000/api/post?page=1&limit=10" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### 2. Search Posts

```bash
# Search for posts containing "javascript"
curl -X GET "http://localhost:5000/api/post?search=javascript&page=1&limit=5" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### 3. Sort Posts

```bash
# Get posts sorted by title in ascending order
curl -X GET "http://localhost:5000/api/post?sortBy=title&sortOrder=ASC&page=1&limit=10" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### 4. Combined Parameters

```bash
# Search + Sort + Pagination
curl -X GET "http://localhost:5000/api/post?search=react&sortBy=createdAt&sortOrder=DESC&page=2&limit=5" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## Expected Response Format

```json
{
  "status": "success",
  "message": "Posts retrieved successfully",
  "data": [
    {
      "id": "1",
      "title": "Learning React Hooks",
      "content": "Today I learned about useState and useEffect...",
      "images": ["react-hooks.png"],
      "createdAt": "2025-07-09T10:30:00Z",
      "updatedAt": "2025-07-09T10:30:00Z",
      "user": {
        "id": "123",
        "firstName": "John",
        "lastName": "Doe",
        "email": "john@example.com",
        "profilePicture": "john-profile.jpg",
        "fullName": "John Doe"
      },
      "stats": {
        "commentCount": 3,
        "hasComments": true
      },
      "latestComments": [
        {
          "id": "456",
          "content": "Great explanation!",
          "createdAt": "2025-07-09T11:00:00Z",
          "user": {
            "id": "789",
            "firstName": "Jane",
            "lastName": "Smith",
            "profilePicture": "jane-profile.jpg",
            "fullName": "Jane Smith"
          }
        }
      ]
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 8,
    "totalItems": 76,
    "itemsPerPage": 10,
    "hasNextPage": true,
    "hasPrevPage": false
  },
  "meta": {
    "timestamp": "2025-07-09T12:00:00Z",
    "version": "1.0",
    "filters": {
      "search": "react",
      "sortBy": "createdAt",
      "sortOrder": "DESC"
    }
  }
}
```

## Frontend Integration Examples

### React with Axios

```typescript
import axios from "axios";

interface PostsResponse {
  status: string;
  message: string;
  data: Post[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
  meta: {
    timestamp: string;
    version: string;
    filters: {
      search: string | null;
      sortBy: string;
      sortOrder: string;
    };
  };
}

const fetchPosts = async (params: {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: "ASC" | "DESC";
}): Promise<PostsResponse> => {
  const response = await axios.get("/api/post", {
    params,
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  });
  return response.data;
};

// Usage
const { data, pagination } = await fetchPosts({
  page: 1,
  limit: 10,
  search: "javascript",
  sortBy: "createdAt",
  sortOrder: "DESC",
});
```

### Vue.js with Fetch

```javascript
async function loadPosts(page = 1, search = "") {
  try {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: "10",
      ...(search && { search }),
      sortBy: "createdAt",
      sortOrder: "DESC",
    });

    const response = await fetch(`/api/post?${params}`, {
      headers: {
        Authorization: `Bearer ${this.$store.state.auth.token}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error("Failed to fetch posts");
    }

    const result = await response.json();

    this.posts = result.data;
    this.pagination = result.pagination;
    this.meta = result.meta;
  } catch (error) {
    console.error("Error loading posts:", error);
    this.error = "Failed to load posts";
  }
}
```

### Angular Service

```typescript
import { Injectable } from "@angular/core";
import { HttpClient, HttpParams } from "@angular/common/http";
import { Observable } from "rxjs";

@Injectable({
  providedIn: "root",
})
export class PostService {
  private baseUrl = "/api/post";

  constructor(private http: HttpClient) {}

  getPosts(
    options: {
      page?: number;
      limit?: number;
      search?: string;
      sortBy?: string;
      sortOrder?: "ASC" | "DESC";
    } = {}
  ): Observable<PostsResponse> {
    let params = new HttpParams();

    Object.entries(options).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        params = params.set(key, value.toString());
      }
    });

    return this.http.get<PostsResponse>(this.baseUrl, { params });
  }
}
```

## Performance Benefits

1. **Reduced Data Transfer**: Only essential data is sent
2. **Faster Loading**: Pagination prevents large payloads
3. **Better UX**: Users see content faster
4. **Scalable**: Handles thousands of posts efficiently
5. **SEO Friendly**: Faster page loads improve rankings

## Query Parameter Reference

| Parameter   | Type   | Default     | Description                      |
| ----------- | ------ | ----------- | -------------------------------- |
| `page`      | number | 1           | Page number (1-based)            |
| `limit`     | number | 10          | Items per page (max 50)          |
| `search`    | string | null        | Search in content, title, author |
| `sortBy`    | string | 'createdAt' | Field to sort by                 |
| `sortOrder` | string | 'DESC'      | ASC or DESC                      |

## Start Testing

1. Make sure your server is running: `npm run dev`
2. Get a valid JWT token by logging in
3. Use the curl commands above or integrate with your frontend
4. Check the Swagger docs at `http://localhost:5000/api-docs`
