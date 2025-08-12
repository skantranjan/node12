/**
 * Simple Bearer Token Middleware
 * Validates a bearer token from the Authorization header
 */

// You can set this in your environment variables
const API_TOKEN = process.env.API_TOKEN || 'your-secret-api-token-here';

function bearerTokenMiddleware(request, reply, done) {
  const authHeader = request.headers['authorization'];
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return reply.code(401).send({ 
      success: false, 
      message: 'Missing or invalid Authorization header. Use: Bearer <your-token>' 
    });
  }
  
  const token = authHeader.split(' ')[1];
  
  if (token !== API_TOKEN) {
    return reply.code(401).send({ 
      success: false, 
      message: 'Invalid API token' 
    });
  }
  
  // Token is valid, continue to the route handler
  done();
}

module.exports = bearerTokenMiddleware; 