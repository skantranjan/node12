const jwt = require('jsonwebtoken');
const jwksClient = require('jwks-rsa');

const tenantId = process.env.AZURE_AD_TENANT_ID;
const clientId = process.env.AZURE_AD_CLIENT_ID;

const client = jwksClient({
  jwksUri: `https://login.microsoftonline.com/${tenantId}/discovery/v2.0/keys`
});

function getKey(header, callback) {
  client.getSigningKey(header.kid, function(err, key) {
    const signingKey = key.getPublicKey();
    callback(null, signingKey);
  });
}

/**
 * Fastify middleware for Azure AD SSO authentication (real JWT validation)
 */
async function ssoMiddleware(request, reply) {
  // Log the Authorization header
  console.log('Authorization Header:', request.headers['authorization']);

  const authHeader = request.headers['authorization'];
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return reply.code(401).send({ success: false, message: 'Authorization header missing or invalid.' });
  }
  const token = authHeader.split(' ')[1];

  try {
    const decoded = await new Promise((resolve, reject) => {
      jwt.verify(token, getKey, {
        audience: clientId,
        issuer: `https://login.microsoftonline.com/${tenantId}/v2.0`,
        algorithms: ['RS256']
      }, (err, decoded) => {
        if (err) reject(err);
        else resolve(decoded);
      });
    });

    // Log the decoded token
    console.log('Decoded Token:', decoded);

    request.user = decoded;
    return;
  } catch (error) {
    request.log.error(error);
    return reply.code(401).send({ success: false, message: 'SSO authentication failed', error: error.message });
  }
}

module.exports = ssoMiddleware; 