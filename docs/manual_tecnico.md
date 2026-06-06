# 📘 Manual Técnico — WhereNext

## 1. Introducción

**WhereNext** es una aplicación Full Stack desarrollada con **React**, **Django REST Framework**, **WebSockets** y **SQLite**.

El objetivo principal de la plataforma es centralizar la planificación de viajes, la gestión de compañeros de viaje (*companions*) y la comunicación en tiempo real dentro de una única aplicación.

---

# 2. Arquitectura General

```text
┌──────────────────────────┐
│      Frontend React      │
│         (Vite)           │
└─────────────┬────────────┘
              │
         Axios + JWT
              │
              ▼
┌──────────────────────────┐
│ Django REST Framework    │
│       Backend API        │
└─────────────┬────────────┘
              │
              ▼
┌──────────────────────────┐
│         SQLite           │
│      Base de Datos       │
└──────────────────────────┘

              ▲
              │
         WebSockets
              │
              ▼
┌──────────────────────────┐
│     Django Channels      │
└──────────────────────────┘
```

---

# 3. Tecnologías Principales

## Frontend

- React
- Vite
- React Router
- Context API
- Axios
- CSS Modules
- WebSockets

## Backend

- Django
- Django REST Framework
- SimpleJWT
- Django Channels
- SQLite
- Pillow

---

# 4. Estructura del Backend

```text
backend/
│
├── apps/
│   ├── users/
│   ├── trips/
│   ├── chat/
│   ├── companions/
│   ├── social/
│   │   ├── invites/
│   │   └── notifications/
│   │
│   └── places/
│
├── backend/
│   ├── settings.py
│   ├── urls.py
│   ├── asgi.py
│   └── wsgi.py
│
└── manage.py
```

---

# 5. Sistema de Autenticación

WhereNext utiliza autenticación basada en **JSON Web Tokens (JWT)**.

## Tokens utilizados

- Access Token
- Refresh Token

## Endpoints principales

```http
POST /api/auth/register/
POST /api/auth/login/
POST /api/auth/token/refresh/
```

### Flujo de autenticación

1. El usuario inicia sesión.
2. El backend genera los tokens JWT.
3. El frontend almacena el token.
4. Axios envía automáticamente el token en las peticiones protegidas.
5. Cuando el token expira se solicita uno nuevo mediante el Refresh Token.

---

# 6. Chat en Tiempo Real (WebSockets)

El sistema de mensajería utiliza **Django Channels**.

## Características

- Comunicación en tiempo real.
- Actualización instantánea de mensajes.
- Salas privadas entre usuarios.
- Serialización mediante JSON.

## Endpoint WebSocket

```text
/ws/chat/<room_id>/
```

---

# 7. Base de Datos

## Motor utilizado

SQLite

## Archivo principal

```text
db.sqlite3
```

## Ventajas

- Configuración mínima.
- Integración nativa con Django.
- Ideal para desarrollo y proyectos académicos.
- Fácil mantenimiento.

---

# 8. Seguridad

WhereNext implementa diversas medidas de seguridad:

## Autenticación

- JWT Authentication
- Control de sesiones

## Protección de datos

- Hashing seguro de contraseñas
- Variables de entorno para secretos

## Validaciones

- Validaciones en frontend
- Validaciones en backend

## Protección contra ataques

- CSRF Protection
- XSS Protection
- Validación de permisos por endpoint

---

# 9. API REST

## Usuarios

```http
POST /api/auth/register/
POST /api/auth/login/
GET  /api/users/profile/
```

## Viajes

```http
GET    /api/trips/
POST   /api/trips/
PATCH  /api/trips/:id/
DELETE /api/trips/:id/
```

## Invitaciones

```http
GET    /api/invites/trip-invites/
POST   /api/invites/trip-invites/
POST   /api/invites/trip-invites/:id/accept/
POST   /api/invites/trip-invites/:id/decline/
POST   /api/invites/trip-invites/:id/cancel/
```

## Chat

```http
GET /api/chats/
```

```text
WS /ws/chat/<room_id>/
```

---

# 10. Deploy

## Backend

**Plataforma:** Render

```bash
gunicorn backend.wsgi:application
```

## Frontend

**Plataforma:** Railway

```env
VITE_API_URL=https://tu-backend.onrender.com
```

---

# 11. Escalabilidad

La arquitectura de WhereNext está preparada para incorporar nuevas funcionalidades sin modificar significativamente la estructura existente.

Posibles ampliaciones:

- Viajes grupales
- Álbumes compartidos
- Geolocalización
- Calendario colaborativo
- Sistema de insignias
- Recomendaciones inteligentes
- Aplicación móvil

---

# 12. Conclusión

WhereNext ha sido desarrollado siguiendo una arquitectura Full Stack moderna basada en React y Django, separando claramente frontend, backend y sistema de comunicación en tiempo real.

La aplicación ofrece una base sólida, escalable y mantenible que permite evolucionar el producto hacia funcionalidades más avanzadas manteniendo una estructura organizada y profesional.