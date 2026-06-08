const db = require('../config/database');
const bcrypt = require('bcrypt');

const BCRYPT_COST = 12;

// Get all users (admin only)
exports.getAllUsers = async (req, res) => {
  try {
    const [users] = await db.query(
      'SELECT id, email, name, created_at FROM admin_users ORDER BY created_at DESC'
    );

    res.status(200).json({
      success: true,
      data: users
    });
  } catch (error) {
    console.error('Erro ao buscar usuários:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao buscar usuários'
    });
  }
};

// Create new user (admin only)
exports.createUser = async (req, res) => {
  try {
    const { email, password, name } = req.body;

    // Validate required fields
    if (!email || !password || !name) {
      return res.status(400).json({
        success: false,
        message: 'Email, senha e nome são obrigatórios'
      });
    }

    // Normalize email
    const normalizedEmail = email.trim().toLowerCase();

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(normalizedEmail)) {
      return res.status(400).json({
        success: false,
        message: 'Email inválido'
      });
    }

    // Check if email already exists
    const [existing] = await db.query(
      'SELECT id FROM admin_users WHERE email = ?',
      [normalizedEmail]
    );

    if (existing.length > 0) {
      return res.status(409).json({
        success: false,
        message: 'Email já cadastrado'
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, BCRYPT_COST);

    // Insert new user
    const [result] = await db.query(
      'INSERT INTO admin_users (email, password_hash, name, password) VALUES (?, ?, ?, "")',
      [normalizedEmail, hashedPassword, name]
    );

    res.status(201).json({
      success: true,
      message: 'Usuário criado com sucesso',
      data: {
        id: result.insertId,
        email: normalizedEmail,
        name
      }
    });
  } catch (error) {
    console.error('Erro ao criar usuário:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao criar usuário'
    });
  }
};

// Update user (admin only)
exports.updateUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const { email, password, name } = req.body;

    // Validate at least one field
    if (!email && !password && !name) {
      return res.status(400).json({
        success: false,
        message: 'Pelo menos um campo deve ser fornecido'
      });
    }

    // Check if user exists
    const [existing] = await db.query(
      'SELECT id FROM admin_users WHERE id = ?',
      [userId]
    );

    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Usuário não encontrado'
      });
    }

    // Build update query dynamically
    const updates = [];
    const values = [];

    if (email) {
      const normalizedEmail = email.trim().toLowerCase();
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(normalizedEmail)) {
        return res.status(400).json({
          success: false,
          message: 'Email inválido'
        });
      }

      // Check if email is already used by another user
      const [emailCheck] = await db.query(
        'SELECT id FROM admin_users WHERE email = ? AND id != ?',
        [normalizedEmail, userId]
      );

      if (emailCheck.length > 0) {
        return res.status(409).json({
          success: false,
          message: 'Email já cadastrado'
        });
      }

      updates.push('email = ?');
      values.push(normalizedEmail);
    }

    if (name) {
      updates.push('name = ?');
      values.push(name);
    }

    if (password) {
      const hashedPassword = await bcrypt.hash(password, BCRYPT_COST);
      updates.push('password_hash = ?');
      values.push(hashedPassword);
      updates.push('password = ""');
    }

    values.push(userId);

    await db.query(
      `UPDATE admin_users SET ${updates.join(', ')} WHERE id = ?`,
      values
    );

    res.status(200).json({
      success: true,
      message: 'Usuário atualizado com sucesso'
    });
  } catch (error) {
    console.error('Erro ao atualizar usuário:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao atualizar usuário'
    });
  }
};

// Delete user (admin only)
exports.deleteUser = async (req, res) => {
  try {
    const { userId } = req.params;

    // Prevent deleting yourself
    if (req.userId && req.userId === parseInt(userId)) {
      return res.status(400).json({
        success: false,
        message: 'Você não pode deletar sua própria conta'
      });
    }

    // Check if user exists
    const [existing] = await db.query(
      'SELECT id FROM admin_users WHERE id = ?',
      [userId]
    );

    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Usuário não encontrado'
      });
    }

    // Delete user
    await db.query('DELETE FROM admin_users WHERE id = ?', [userId]);

    res.status(200).json({
      success: true,
      message: 'Usuário deletado com sucesso'
    });
  } catch (error) {
    console.error('Erro ao deletar usuário:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao deletar usuário'
    });
  }
};
