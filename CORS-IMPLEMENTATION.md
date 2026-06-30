# CORS Implementation Guide

## Overview
Cross-Origin Resource Sharing (CORS) has been successfully implemented in your NestJS application to allow secure cross-origin requests from your React frontend and other trusted domains.

## What is CORS?
CORS is a security mechanism that allows resources on a web server to be requested from another domain. Without proper CORS configuration, browsers block requests from different origins as a security measure.

## Configuration

### Location
The CORS configuration is implemented in `src/main.ts`

### Features Enabled

#### 1. **Dynamic Origin Validation**
- Checks if the requesting origin is in the allowed list
- Allows requests without origin (mobile apps, Postman, curl)
- Blocks unauthorized origins with proper error messages

#### 2. **Allowed HTTP Methods**
```
GET, POST, PUT, PATCH, DELETE, OPTIONS
```

#### 3. **Allowed Headers**
- Content-Type
- Authorization (for JWT tokens)
- X-Requested-With
- Accept
- Origin

#### 4. **Credentials Support**
- Enabled `credentials: true` to allow:
  - Cookies
  - Authentication headers
  - TLS client certificates

#### 5. **Preflight Handling**
- OPTIONS requests handled automatically
- Returns 204 status for compatibility with legacy browsers

## Environment Configuration

### `.env` File
```env
# CORS Configuration (comma-separated list of allowed origins)
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3001
```

### Adding Multiple Origins
To allow multiple domains, separate them with commas:
```env
ALLOWED_ORIGINS=http://localhost:3000,https://myapp.com,https://staging.myapp.com
```

### Production Configuration
For production, update your `.env` file:
```env
ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com
```

## Testing CORS

### 1. Test with Frontend
Your React frontend (http://localhost:3000) can now make requests to the backend (http://localhost:3002):

```javascript
// Example fetch request
fetch('http://localhost:3002/todos', {
  method: 'GET',
  credentials: 'include', // Include cookies/auth
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer YOUR_TOKEN'
  }
})
```

### 2. Test with curl
```bash
# Test preflight request
curl -X OPTIONS http://localhost:3002/todos \
  -H "Origin: http://localhost:3000" \
  -H "Access-Control-Request-Method: POST" \
  -v

# Test actual request
curl -X GET http://localhost:3002/todos \
  -H "Origin: http://localhost:3000" \
  -v
```

### 3. Check Response Headers
You should see these headers in responses:
```
Access-Control-Allow-Origin: http://localhost:3000
Access-Control-Allow-Methods: GET,POST,PUT,PATCH,DELETE,OPTIONS
Access-Control-Allow-Headers: Content-Type,Authorization,X-Requested-With,Accept,Origin
Access-Control-Allow-Credentials: true
```

## Security Best Practices

### ✅ Implemented
- **Origin validation** - Only allowed origins can access the API
- **Method restrictions** - Only necessary HTTP methods are allowed
- **Header restrictions** - Only specific headers are permitted
- **Credentials support** - Enables secure authentication

### 🔒 Additional Recommendations

1. **Production Origins**
   - Never use wildcards (`*`) in production
   - Always specify exact domains
   - Use HTTPS in production

2. **Environment-Specific Config**
   ```env
   # Development
   ALLOWED_ORIGINS=http://localhost:3000

   # Production
   ALLOWED_ORIGINS=https://yourdomain.com
   ```

3. **Monitor CORS Errors**
   - Check browser console for CORS errors
   - Review server logs for blocked requests

## Troubleshooting

### Issue: CORS error in browser
**Solution:** Verify the frontend URL is in `ALLOWED_ORIGINS`

### Issue: Credentials not working
**Solution:** Ensure `credentials: 'include'` is set in fetch requests

### Issue: Preflight fails
**Solution:** Check that OPTIONS method is allowed and server is responding to preflight requests

### Issue: Custom headers rejected
**Solution:** Add the custom header to `allowedHeaders` array in `main.ts`

## Integration with Existing Security

CORS works alongside:
- ✅ **Helmet** - Web security headers
- ✅ **JWT Authentication** - Token-based auth
- ✅ **Validation Pipes** - Request validation

## Quick Reference

| Feature | Status | Configuration |
|---------|--------|---------------|
| Origin Validation | ✅ Enabled | `.env` → `ALLOWED_ORIGINS` |
| Methods | ✅ Configured | GET, POST, PUT, PATCH, DELETE, OPTIONS |
| Headers | ✅ Configured | Content-Type, Authorization, etc. |
| Credentials | ✅ Enabled | Cookies & auth headers allowed |
| Preflight | ✅ Auto-handled | Returns 204 status |

## Summary

✅ **CORS is now fully configured and working**
- Your React frontend can securely communicate with the backend
- Unauthorized origins are blocked
- Authentication and cookies work correctly
- Production-ready with environment-based configuration

The backend server has automatically restarted with the new CORS configuration.
