import bcrypt from "bcryptjs";
import { UserModel } from "../models/user.model.js";
import { successResponse } from "../utils/response.handler.js"; 
import { catchAsync } from "../utils/catchAsync.js"; 
import jwt from "jsonwebtoken";

export const register = catchAsync(async (req, res, next) => {
  // Los datos ya vienen limpios y validados por el middleware de Zod
  const { name, email, password } = req.body;

  // 1. Validar unicidad: ¿El correo ya existe?
  const existingUser = await UserModel.findByEmail(email);
  if (existingUser) {
    // Simulamos la estructura de error de Zod para que el Frontend 
    // lo procese exactamente igual que los errores de sintaxis.
    const emailError = new Error("Error de validación en los datos enviados");
    emailError.statusCode = 400;
    emailError.errors = [
      { 
        field: "email", 
        message: "Este correo ya se encuentra registrado." 
      }
    ];
    return next(emailError);
  }

  // 2. Seguridad: Encriptación de la contraseña
  // El "salt" (sal) añade aleatoriedad al hash para evitar ataques de diccionario
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  // 3. Persistencia: Guardamos en la base de datos
  const newUser = await UserModel.create({
    name,
    email,
    password: hashedPassword, // ¡Guardamos el hash, no el texto plano!
  });

  // 4. Limpieza de datos (Data Sanitization)
  // NUNCA devolvemos la contraseña al cliente, ni siquiera la encriptada.
  // Usamos desestructuración para separar el password del resto del objeto.
  const { password: _, ...userWithoutPassword } = newUser;

  // 5. Respuesta estandarizada
  return successResponse(
    res, 
    201, // 201: Created
    "Usuario registrado exitosamente", 
    userWithoutPassword
  );
});

export const login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  // 1. Verificar si el usuario existe
  const user = await UserModel.findByEmail(email);
  if (!user) {
    // Usamos un mensaje genérico por seguridad
    const error = new Error("Credenciales inválidas");
    error.statusCode = 401; // 401: Unauthorized
    return next(error);
  }

  // 2. Verificar la contraseña
  // bcrypt.compare toma el texto plano y el hash de la BD y verifica si coinciden
  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    const error = new Error("Credenciales inválidas");
    error.statusCode = 401;
    return next(error);
  }

  // 3. Generar los Tokens (Los "Pasaportes")
  // El Access Token dura poco (ej: 15 minutos)
  const accessToken = jwt.sign(
    { id: user.id }, // El payload: la información que viaja dentro del token
    process.env.JWT_SECRET, // La llave secreta (¡En el archivo .env!)
    { expiresIn: "15m" } 
  );

  // El Refresh Token dura mucho (ej: 7 días)
  const refreshToken = jwt.sign(
    { id: user.id },
    process.env.JWT_REFRESH_SECRET, 
    { expiresIn: "7d" }
  );

  // 4. Guardar el Refresh Token en la base de datos
  await UserModel.updateRefreshToken(user.id, refreshToken);

  // 4.5 Obtener los roles del usuario desde la Data Base 
  const roles = await UserModel.getRolesWithPermissions(user.id);

  // 5. Limpieza: No devolvemos la contraseña al Frontend
  const { password: _, refresh_token: __, ...userWithoutSensitiveData } = user;

  // 6. Respondemos con éxito entregando los tokens y los datos del usuario
  return successResponse(res, 200, "Inicio de sesión exitoso", {
    user: userWithoutSensitiveData,
    roles,
    accessToken,
    refreshToken
  });
});

export const refreshToken = catchAsync(async (req, res, next) => {
  const tokenFromClient = req.body.refreshToken;

  try {
    // 1. Verificamos matemáticamente que el Refresh Token sea auténtico y no haya expirado
    const decoded = jwt.verify(tokenFromClient, process.env.JWT_REFRESH_SECRET);

    // 2. Buscamos al usuario dueño de este token en la base de datos
    const user = await UserModel.findById(decoded.id);

    // 3. VALIDACIÓN DE SEGURIDAD
    // ¿El usuario existe? Y lo más importante: ¿El token que nos envía 
    // es EXACTAMENTE el mismo que tenemos guardado en la base de datos?
    // Si no coincide, significa que el usuario cerró sesión en otro dispositivo 
    // o que nosotros le revocamos el acceso manualmente.
    if (!user || user.refresh_token !== tokenFromClient) {
      const error = new Error("Token de refresco inválido o revocado");
      error.statusCode = 401;
      return next(error);
    }

    // 4. Si todo está perfecto, le imprimimos un NUEVO Access Token (Pase VIP)
    const newAccessToken = jwt.sign(
      { id: user.id },
      process.env.JWT_SECRET,
      { expiresIn: "15m" } // Le damos otros 15 minutos de vida
    );

    // 5. Entregamos el nuevo token
    return successResponse(res, 200, "Token renovado exitosamente", {
      accessToken: newAccessToken
    });

  } catch (err) {
    // Si la función jwt.verify falla (porque el refresh token caducó o lo alteraron)
    const error = new Error("El token de refresco es inválido o ha expirado. Por favor inicie sesión nuevamente.");
    error.statusCode = 401;
    return next(error);
  }
});