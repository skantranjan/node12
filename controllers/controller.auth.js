const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h';

/**
 * Controller for user authentication
 */
async function loginController(request, reply) {
  try {
    const { username, password } = request.body;

    // Validate input
    if (!username || !password) {
      return reply.code(400).send({
        success: false,
        message: 'Username and password are required'
      });
    }

    // TODO: Replace with your actual user authentication logic
    // This is a placeholder - you should query your database
    const mockUser = {
      id: 1,
      username: 'admin',
      email: 'admin@example.com',
      role: 'admin'
    };

    // TODO: Replace with actual password verification
    // const isValidPassword = await bcrypt.compare(password, user.password);
    const isValidPassword = password === 'admin123'; // Replace with real auth

    if (!isValidPassword) {
      return reply.code(401).send({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      {
        userId: mockUser.id,
        username: mockUser.username,
        email: mockUser.email,
        role: mockUser.role
      },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    return reply.send({
      success: true,
      message: 'Login successful',
      data: {
        token,
        user: {
          id: mockUser.id,
          username: mockUser.username,
          email: mockUser.email,
          role: mockUser.role
        }
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    return reply.code(500).send({
      success: false,
      message: 'Internal server error'
    });
  }
}

/**
 * Controller to verify JWT token
 */
async function verifyTokenController(request, reply) {
  try {
    // The JWT middleware already verified the token
    // We just need to return the user info
    return reply.send({
      success: true,
      message: 'Token is valid',
      data: {
        user: request.user
      }
    });
  } catch (error) {
    console.error('Token verification error:', error);
    return reply.code(500).send({
      success: false,
      message: 'Internal server error'
    });
  }
}

module.exports = {
  loginController,
  verifyTokenController
}; 