const db = require('../config/database');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
require('dotenv').config();

// Login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email e senha são obrigatórios'
      });
    }

    // Normalize email: trim and lowercase
    const normalizedEmail = email.trim().toLowerCase();

    // Find user by email (assumes emails stored normalized in DB)
    const [users] = await db.query(
      'SELECT id, email, password_hash, name FROM admin_users WHERE email = ?',
      [normalizedEmail]
    );

    if (users.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Email ou senha incorretos'
      });
    }

    const user = users[0];

    // Check if password_hash exists
    if (!user.password_hash) {
      return res.status(401).json({
        success: false,
        message: 'Senha não configurada. Contate o administrador.'
      });
    }

    // Compare password with bcrypt hash (cost 12)
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Email ou senha incorretos'
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        name: user.name
      },
      process.env.JWT_SECRET,
      {
        expiresIn: process.env.JWT_EXPIRES_IN || '7d'
      }
    );

    res.status(200).json({
      success: true,
      message: 'Login realizado com sucesso',
      data: {
        user: {
          id: user.id,
          email: user.email,
          name: user.name
        },
        token
      }
    });
  } catch (error) {
    console.error('Erro ao fazer login:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao fazer login'
    });
  }
};

// Verify token (check if user is authenticated)
exports.verifyToken = async (req, res) => {
  try {
    // User info already added by authMiddleware
    const [users] = await db.query(
      'SELECT id, email, name FROM admin_users WHERE id = ?',
      [req.userId]
    );

    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Usuário não encontrado'
      });
    }

    res.status(200).json({
      success: true,
      data: {
        user: users[0]
      }
    });
  } catch (error) {
    console.error('Erro ao verificar token:', error);
    res.status(500).json({
      success: false,
      message: 'Erro ao verificar token'
    });
  }
};
