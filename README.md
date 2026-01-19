# autotrade

## Frontend ↔ Backend bağlantısı

React arayüzü, backend'e istek atmak için `VITE_API_BASE_URL` değişkenini kullanır. Bu değişken boş bırakılırsa aynı origin'e (`/api/...`) istek atılır.

Örnek `.env` (frontend):

```
VITE_API_BASE_URL=http://localhost:5000
```

Backend tarafında CORS için `CORS_ORIGINS` kullanılabilir:

```
CORS_ORIGINS=http://localhost:5173,http://127.0.0.1:5173
```
