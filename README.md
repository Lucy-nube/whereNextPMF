# 🌍 WhereNext

<div align="center">

<img src="media/wherenext.png" alt="WhereNext Banner" width="850"/>

### ✈️ Explora · 🤝 Comparte · 🌎 Conecta · 🧳 Viaja

**La plataforma colaborativa para organizar viajes, descubrir destinos y compartir experiencias en tiempo real.**
<div align="center">

## 🎥 Demo en Vídeo  
🔗 https://youtu.be/20Vlv-Rmy0k

</div>


<br>

![React](https://img.shields.io/badge/React-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![Django](https://img.shields.io/badge/Django-092E20?style=for-the-badge&logo=django)
<img src="https://img.shields.io/badge/Database-SQLite-07405e?style=for-the-badge&logo=sqlite" />
![JWT](https://img.shields.io/badge/JWT-000000?style=for-the-badge&logo=jsonwebtokens)
![WebSockets](https://img.shields.io/badge/WebSockets-4CAF50?style=for-the-badge)
![Render](https://img.shields.io/badge/Render-46E3B7?style=for-the-badge&logo=render)
![Railway](https://img.shields.io/badge/Railway-0B0D0E?style=for-the-badge&logo=railway)

<br>

[🚀 Demo](#) • [📖 Documentación](#) • [🐛 Reportar Bug](#) • [✨ Solicitar Feature](#)

</div>

---

## 📋 Tabla de Contenidos

- [✨ Sobre el Proyecto](#-sobre-el-proyecto)
- [🎯 Problema que Resuelve](#-problema-que-resuelve)
- [🚀 Funcionalidades](#-funcionalidades)
- [🛠️ Stack Tecnológico](#️-stack-tecnológico)
- [📸 Capturas](#-capturas)
- [🏗️ Arquitectura](#️-arquitectura)
- [⚙️ Instalación](#️-instalación)
- [🔑 Variables de Entorno](#-variables-de-entorno)
- [🌐 API](#-api)
- [🔒 Seguridad](#-seguridad)
- [🗺️ Roadmap](#️-roadmap)
- [👩‍💻 Autor](#-autor)

---

# ✨ Sobre el Proyecto

**WhereNext** es una aplicación Full Stack diseñada para simplificar la organización de viajes en grupo.

La plataforma centraliza toda la experiencia de planificación en un único lugar, permitiendo descubrir destinos, organizar viajes, gestionar compañeros y comunicarse en tiempo real.

### ¿Qué puedes hacer?

- 🌍 Explorar viajes y destinos
- ✈️ Crear y gestionar viajes
- 👥 Invitar companions
- 💬 Chatear en tiempo real
- ⭐ Guardar favoritos
- 🔒 Controlar la privacidad de perfiles y viajes
- 📸 Compartir experiencias

---

# 🎯 Problema que Resuelve

Organizar viajes suele implicar utilizar múltiples herramientas al mismo tiempo:

```text
WhatsApp + Google Maps + Notas + Fotos + Calendario + Emails
```

Esto genera:

- Información dispersa
- Mala coordinación
- Duplicación de tareas
- Pérdida de contexto

### Solución

```text
WhereNext
│
├──Perfil
├── Viajes
├── Explorar
├── Invitaciones
├── Companions
├── Chat
└── Favoritos
```

Todo centralizado en una única plataforma.

---

## ✅ Funcionalidades completadas

- Sistema de viajes
- Invitaciones a compañeros
- Gestión de companions
- Chat en tiempo real
- Feed social
- Likes y comentarios
- Sistema de privacidad
- Álbum de fotos

## ✈️ Gestión de Viajes

- Crear viajes
- Editar viajes
- Eliminar viajes
- Configurar privacidad
- Gestionar participantes

## 🌍 Exploración de Destinos

- Descubrir lugares
- Explorar viajes públicos
- Buscar inspiración para futuros viajes

## 👥 Sistema de Companions

- Solicitudes de amistad
- Gestión de contactos
- Bloqueo y eliminación de usuarios

## 💬 Chat en Tiempo Real

- Comunicación instantánea
- Actualización automática
- Implementación mediante WebSockets

## 🔒 Privacidad

- Perfiles públicos o privados
- Viajes públicos, privados o solo companions

---

# 🛠️ Stack Tecnológico

## Frontend

| Tecnología | Descripción |
|------------|-------------|
| React | Biblioteca principal |
| React Router | Navegación |
| Axios | Comunicación con API |
| Context API | Gestión global de estado |
| CSS Modules | Estilos modulares |
| WebSockets | Tiempo real |

## Backend

| Tecnología | Descripción |
|------------|-------------|
| Django | Framework principal |
| Django REST Framework | API REST |
| SimpleJWT | Autenticación |
| Django Channels | WebSockets |
| Pillow | Gestión de imágenes |
| SQLite | Base de datos |

## DevOps

| Herramienta | Uso |
|------------|-----|
| GitHub | Control de versiones |
| Render | Backend Deployment |
| Railway | Hosting |
| Environment Variables | Seguridad |

---

# 📸 Capturas

## 🏠 Home

<div align="center">
<img src="media/loginfrontend.png" width="900"/>
</div>

---

## 👤 Perfil

<div align="center">
<img src="media/Profile.png" width="900"/>
</div>

---

## ✈️ Detalle del Viaje

<div align="center">
<img src="media/misviajesfronted.png" width="900"/>
</div>

---

## 💬 Chat en Tiempo Real

<div align="center">
<img src="media/ChatSauloluz.png" width="900"/>
</div>

---

## 📱 Responsive

<div align="center">
<img src="media/responsivehome.png" width="350"/>
</div>

---

# 🏗️ Arquitectura

```text
┌────────────────────┐
│      React         │
│     Frontend       │
└─────────┬──────────┘
          │ Axios + JWT
          ▼
┌────────────────────┐
│ Django REST API    │
└─────────┬──────────┘
          │
          ▼
┌────────────────────┐
│       SQLite      │
└────────────────────┘

          ▲
          │ WebSockets
          ▼

┌────────────────────┐
│ Django Channels    │
└────────────────────┘
```

---

# ⚙️ Instalación

## 1️⃣ Clonar el repositorio

```bash
git clone https://github.com/Lucy-nube/whereNextPMF.git

cd whereNextPMF
```

---

## 2️⃣ Backend

```bash
cd whereNext-backend

python -m venv venv

source venv/bin/activate

# Windows
venv\Scripts\activate

pip install -r requirements.txt

python manage.py migrate

python manage.py runserver
```

Servidor:

```text
http://localhost:8000
```

---

## 3️⃣ Frontend

```bash
cd whereNext-frontend

npm install

npm run dev
```

Aplicación:

```text
http://localhost:5173
```

---

> Nota: Este proyecto utiliza SQLite durante el desarrollo por su simplicidad y porque no requiere configuración adicional.  
> La arquitectura está preparada para migrar fácilmente a PostgreSQL u otro motor en producción.

# 🔑 Variables de Entorno

## Backend (.env)

SECRET_KEY=your_secret_key

DEBUG=False

# SQLite no requiere DATABASE_URL
# Django usa automáticamente db.sqlite3
ALLOWED_HOSTS=localhost,127.0.0.1


## Frontend (.env)

```env
VITE_API_URL=http://localhost:8000
```

---

# 🌐 API

## Autenticación

```http
POST /api/auth/register/
POST /api/auth/login/
POST /api/auth/token/refresh/
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
GET    /api/trip-invites/
POST   /api/trip-invites/
PATCH  /api/trip-invites/:id/accept/
PATCH  /api/trip-invites/:id/reject/
```

## Chat

```http
GET /api/chats/

WS /ws/chat/:room_id/
```

---

# 🔒 Seguridad

WhereNext implementa:

- JWT Authentication
- Control de permisos por endpoint
- Validaciones frontend y backend
- Protección CSRF
- Protección XSS
- Variables de entorno para secretos
- Hashing seguro de contraseñas
- HTTPS en producción

---


# 🎓 Aprendizajes

Durante el desarrollo de este proyecto se profundizó en:

- Arquitectura Full Stack
- React y Context API
- Django REST Framework
- SQLite 
- JWT Authentication
- WebSockets con Django Channels
- Deploy en producción
- Diseño de APIs REST
- Buenas prácticas de desarrollo

---

# 👩🏽‍💻 Autora

## Lucy Esther De León Corporán

Full Stack Developer

Proyecto desarrollado como Trabajo Final del Máster Full Stack.

Responsable de:

- Diseño UX/UI
- Arquitectura Frontend
- Arquitectura Backend
- Modelado de Base de Datos
- Sistema de Companions
- Sistema de Invitaciones
- Chat en Tiempo Real
- Seguridad y Autenticación
- Deploy y DevOps

### Tecnologías utilizadas

```text
React • Django • SQLite  • JWT • WebSockets • Render • Railway
```

---
# 📄 Licencia

Este proyecto ha sido desarrollado con fines académicos y educativos.

© 2026 Lucy Esther De León Corporán. Todos los derechos reservados.

# 🙏 Agradecimientos

Gracias al equipo docente del Máster en Desarrollo Full Stack por su acompañamiento durante todo el proceso de aprendizaje.

También a la comunidad de desarrolladores por compartir conocimiento y buenas prácticas que han ayudado a construir este proyecto.

---

<div align="center">

## 🌟 WhereNext

### El viaje comienza mucho antes de despegar.

Si te gusta este proyecto, considera darle una ⭐ al repositorio.

</div>