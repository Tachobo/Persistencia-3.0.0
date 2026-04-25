import pool from "../config/db.js";

export const UserModel = {
  // 1. Método para verificar si el correo ya existe
  findByEmail: async (email) => {
    const [rows] = await pool.query("SELECT * FROM users WHERE email = ?", [
      email,
    ]);
    return rows[0];
  },

  // 2. Método para registrar al usuario
  create: async (newUser) => {
    const { name, email, password } = newUser;

    // Insertamos el usuario con la contraseña que ya vendrá encriptada desde el controlador
    const [result] = await pool.query(
      "INSERT INTO users (name, email, password) VALUES (?, ?, ?)",
      [name, email, password]
    );

    // Buscamos el usuario recién creado
    const [createdUser] = await pool.query(
      "SELECT * FROM users WHERE id = ?",
      [result.insertId]
    );
    
    return createdUser[0];
  },

  // 3. Guardar el Refresh Token en la base de datos
  updateRefreshToken: async (id, refreshToken) => {
    const [result] = await pool.query(
      "UPDATE users SET refresh_token = ? WHERE id = ?",
      [refreshToken, id]
    );
    return result.affectedRows > 0;
  },

  // 4. Borrar el Refresh Token (Para el Logout)
  clearRefreshToken: async (id) => {
    const [result] = await pool.query(
      "UPDATE users SET refresh_token = NULL WHERE id = ?",
      [id]
    );
    return result.affectedRows > 0;
  },

  // 5. Buscar usuario por ID
  findById: async (id) => {
    const [rows] = await pool.query("SELECT * FROM users WHERE id = ?", [id]);
    return rows[0]; // Retorna el usuario o undefined
  },
};