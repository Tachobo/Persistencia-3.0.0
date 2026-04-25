import { UserModel } from "../models/user.model.js";

/**
 * Middleware de autorización RBAC.
 *
 * Usa un closure para recibir el permiso requerido
 * y retorna la función (req, res, next) que Express necesita.
 *
 * @param {string} requiredPermission 
 */
export const checkPermission = (requiredPermission) => {
return async (req, res, next) => {
    try {
      // req.user.id lo inyectó verifyToken antes de llegar aquí
      // Si checkPermission corre sin verifyToken antes, esto se despapaya
    const userId = req.user.id;

      // 1. Consulta la BD en tiempo real
      // Se asume que este método ya existe, que fue el metodo del reto 1
    const roles = await UserModel.getRolesWithPermissions(userId);

      // 2. Si el usuario no tiene ningún rol asignado
    if (!roles || roles.length === 0) {
        const error = new Error("El usuario no tiene roles asignados");
        error.statusCode = 403;
        return next(error);
    }

      // 3. Lógica de múltiples roles
      // .some() recorre todos los roles y retorna true
      // cuando encuentra uno que tenga el permiso requerido
    const hasPermission = roles.some((roleObj) =>
        roleObj.permissions.includes(requiredPermission)
    );

      // 4. Si ningún rol tiene el permiso → 403 Prohibido
    if (!hasPermission) {
        const error = new Error(
        `Acceso denegado. Se requiere el permiso: '${requiredPermission}'`
        );
        error.statusCode = 403;
        return next(error);
    }

      // 5. Permiso concedido — continua
    req.userRoles = roles;
    next();

    } catch (err) {
    next(err);
    }
};
};