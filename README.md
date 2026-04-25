# API de Productos - Arquitectura en Capas

¡Bienvenido, aprendiz! Este proyecto es tu puerta de entrada al mundo del Backend. Aquí aprenderás a construir una API robusta utilizando **Node.js** y **ES Modules**.

Para que te enfoques en la estructura, esta versión utiliza **persistencia en memoria** (un arreglo). Imagina que estamos construyendo un sistema de gestión para una tienda; antes de comprar una caja fuerte de acero (Base de Datos), vamos a aprender a organizar los papeles en una gaveta (Memoria).

---

## 1. Instalación y Configuración

Sigue estos pasos para preparar tu entorno:

```bash
# 1. Inicializar el proyecto
npm init -y

# 2. Instalar Express (Nuestro Framework)
npm install express

# 3. Instalar Nodemon (Para no reiniciar el servidor manualmente)
npm install -D nodemon
```

### Ajuste de Seguridad en `package.json`
Para que tu servidor reconozca los `import`, añade `"type": "module"` en tu archivo `package.json`. También asegúrate de configurar tus scripts así:
```json
"scripts": {
  "dev": "nodemon server.js",
  "start": "node server.js"
}
```

---

## 2. La "Ciudad" de nuestro Código (Estructura)

Organizamos el proyecto como si fuera un edificio administrativo para que nadie se pierda:

```text
├── src/
│   ├── routes/        #  La Recepción
│   ├── controllers/   # El Gerente
│   ├── models/        # El Archivista
│   ├── data/          # La Bodega
│   └── app.js         # La Maquinaria
├── server.js          # El Interruptor
└── README.md          # El Manual
```

---

## 3. Guía de Capas y sus Analogías

Para que el código sea profesional, cada archivo tiene una "misión única":

* **`server.js` (El Interruptor):** Es un archivo pequeño y directo. Su única función es "encender la luz". No sabe de lógica, solo sabe que debe avisar cuando el servidor está listo para escuchar.
* **`src/app.js` (La Maquinaria):** Aquí se ensambla todo. Configura las reglas de la casa (como entender JSON) y conecta las rutas. Es el motor que hace que Express funcione.
* **`src/routes/` (La Recepción):** Es la primera parada del usuario. El recepcionista mira la URL y dice: *"Ah, vienes por productos, ve a la oficina de allá"*. Su trabajo es solo **dirigir el tráfico**.
* **`src/controllers/` (El Gerente):** Es el que toma las decisiones. Recibe al usuario, analiza qué pidió, le da órdenes al Archivista (Modelo) y finalmente le entrega una respuesta al cliente: *"Aquí tienes lo que pediste"* o *"Lo siento, no lo encontramos"*.
* **`src/models/` (El Archivista):** Es el especialista en los datos. Es el único que sabe cómo buscar, guardar o borrar cosas de la bodega. El Gerente no toca la mercancía, siempre se la pide al Archivista.
* **`src/data/` (La Bodega):** Es un simple cajón donde guardamos nuestros datos en un arreglo. Es temporal, pero vital para que el Archivista tenga algo que buscar.

---

## 4. El Ciclo de una Petición (El Camino)

1. El **Usuario** llega a la **Recepción** (`routes`).
2. La **Recepción** lo manda con el **Gerente** (`controllers`).
3. El **Gerente** le pide la información al **Archivista** (`models`).
4. El **Archivista** saca el producto de la **Bodega** (`data`).
5. El **Gerente** recibe el producto y se lo entrega al **Usuario**.

---
> **Recuerda:** En programación, si cada quien hace su trabajo, el sistema nunca falla. ¡A programar!

// Prueba de funcionamiento de la plantilla de PR - Marzo 2026