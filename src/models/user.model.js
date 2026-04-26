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
  
   // 6. Obtener los roles y permisos completos de un usuario
  getRolesWithPermissions: async (userId) => {
    const [rows] = await pool.query(
      `SELECT 
        r.name  AS role_name,
        p.name  AS permission_name
      FROM user_roles ur
      JOIN roles r             ON ur.role_id       = r.id
      JOIN role_permissions rp ON rp.role_id       = r.id
      JOIN permissions p       ON rp.permission_id = p.id
      WHERE ur.user_id = ?`,
      [userId]
    );

    const rolesMap = {};

    for (const row of rows) {
      if (!rolesMap[row.role_name]) {
        rolesMap[row.role_name] = {
          role: row.role_name,
          permissions: [],
        };
      }
      rolesMap[row.role_name].permissions.push(row.permission_name);
    }

    return Object.values(rolesMap);
  },
};


