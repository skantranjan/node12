const pool = require('../config/db.config');

/**
 * Add PM User Model
 * Handles user data insertion with email validation
 */

async function addPmUser(userData) {
  const client = await pool.connect();
  
  try {
    // First check if user already exists with the email
    const checkQuery = `
      SELECT id, username, email, role, is_active, created_at
      FROM public.sdp_users 
      WHERE email = $1
    `;
    
    const checkResult = await client.query(checkQuery, [userData.email]);
    
    if (checkResult.rows.length > 0) {
      return {
        success: false,
        message: 'User already exists with this email address',
        existingUser: checkResult.rows[0]
      };
    }
    
    // If user doesn't exist, insert new user
    const insertQuery = `
      INSERT INTO public.sdp_users (username, email, role, is_active, created_at)
      VALUES ($1, $2, $3, $4, NOW())
      RETURNING id, username, email, role, is_active, created_at
    `;
    
    const insertValues = [
      userData.username,
      userData.email,
      userData.role || 'pm', // Default role to 'pm'
      userData.is_active !== undefined ? userData.is_active : true
    ];
    
    const insertResult = await client.query(insertQuery, insertValues);
    
    return {
      success: true,
      message: 'PM user added successfully',
      data: insertResult.rows[0]
    };
    
  } catch (error) {
    console.error('Error in addPmUser:', error);
    return {
      success: false,
      message: 'Failed to add PM user',
      error: error.message
    };
  } finally {
    client.release();
  }
}

/**
 * Get All PM Users
 */
async function getAllPmUsers() {
  const client = await pool.connect();
  
  try {
    const query = `
      SELECT id, username, email, role, is_active, created_at
      FROM public.sdp_users
      ORDER BY created_at DESC
    `;
    
    const result = await client.query(query);
    
    return {
      success: true,
      message: 'PM users retrieved successfully',
      data: result.rows
    };
    
  } catch (error) {
    console.error('Error in getAllPmUsers:', error);
    return {
      success: false,
      message: 'Failed to retrieve PM users',
      error: error.message
    };
  } finally {
    client.release();
  }
}

/**
 * Get PM User by ID
 */
async function getPmUserById(userId) {
  const client = await pool.connect();
  
  try {
    const query = `
      SELECT id, username, email, role, is_active, created_at
      FROM public.sdp_users
      WHERE id = $1
    `;
    
    const result = await client.query(query, [userId]);
    
    if (result.rows.length === 0) {
      return {
        success: false,
        message: 'PM user not found'
      };
    }
    
    return {
      success: true,
      message: 'PM user retrieved successfully',
      data: result.rows[0]
    };
    
  } catch (error) {
    console.error('Error in getPmUserById:', error);
    return {
      success: false,
      message: 'Failed to retrieve PM user',
      error: error.message
    };
  } finally {
    client.release();
  }
}

/**
 * Update PM User
 */
async function updatePmUser(userId, userData) {
  const client = await pool.connect();
  
  try {
    // Check if user exists
    const checkQuery = `
      SELECT id FROM public.sdp_users WHERE id = $1
    `;
    
    const checkResult = await client.query(checkQuery, [userId]);
    
    if (checkResult.rows.length === 0) {
      return {
        success: false,
        message: 'PM user not found'
      };
    }
    
    // If email is being updated, check if new email already exists
    if (userData.email) {
      const emailCheckQuery = `
        SELECT id FROM public.sdp_users 
        WHERE email = $1 AND id != $2
      `;
      
      const emailCheckResult = await client.query(emailCheckQuery, [userData.email, userId]);
      
      if (emailCheckResult.rows.length > 0) {
        return {
          success: false,
          message: 'Email already exists with another user'
        };
      }
    }
    
    // Build update query dynamically
    const updateFields = [];
    const updateValues = [];
    let paramCount = 1;
    
    if (userData.username !== undefined) {
      updateFields.push(`username = $${paramCount}`);
      updateValues.push(userData.username);
      paramCount++;
    }
    
    if (userData.email !== undefined) {
      updateFields.push(`email = $${paramCount}`);
      updateValues.push(userData.email);
      paramCount++;
    }
    
    if (userData.role !== undefined) {
      updateFields.push(`role = $${paramCount}`);
      updateValues.push(userData.role);
      paramCount++;
    }
    
    if (userData.is_active !== undefined) {
      updateFields.push(`is_active = $${paramCount}`);
      updateValues.push(userData.is_active);
      paramCount++;
    }
    
    if (updateFields.length === 0) {
      return {
        success: false,
        message: 'No fields to update'
      };
    }
    
    updateValues.push(userId);
    
    const updateQuery = `
      UPDATE public.sdp_users 
      SET ${updateFields.join(', ')}
      WHERE id = $${paramCount}
      RETURNING id, username, email, role, is_active, created_at
    `;
    
    const result = await client.query(updateQuery, updateValues);
    
    return {
      success: true,
      message: 'PM user updated successfully',
      data: result.rows[0]
    };
    
  } catch (error) {
    console.error('Error in updatePmUser:', error);
    return {
      success: false,
      message: 'Failed to update PM user',
      error: error.message
    };
  } finally {
    client.release();
  }
}

/**
 * Delete PM User
 */
async function deletePmUser(userId) {
  const client = await pool.connect();
  
  try {
    // Check if user exists
    const checkQuery = `
      SELECT id FROM public.sdp_users WHERE id = $1
    `;
    
    const checkResult = await client.query(checkQuery, [userId]);
    
    if (checkResult.rows.length === 0) {
      return {
        success: false,
        message: 'PM user not found'
      };
    }
    
    const deleteQuery = `
      DELETE FROM public.sdp_users 
      WHERE id = $1
      RETURNING id, username, email, role, is_active, created_at
    `;
    
    const result = await client.query(deleteQuery, [userId]);
    
    return {
      success: true,
      message: 'PM user deleted successfully',
      data: result.rows[0]
    };
    
  } catch (error) {
    console.error('Error in deletePmUser:', error);
    return {
      success: false,
      message: 'Failed to delete PM user',
      error: error.message
    };
  } finally {
    client.release();
  }
}

module.exports = {
  addPmUser,
  getAllPmUsers,
  getPmUserById,
  updatePmUser,
  deletePmUser
}; 