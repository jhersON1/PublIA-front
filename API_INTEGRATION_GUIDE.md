# Guía de Integración de APIs de Redes Sociales

Esta guía proporciona información sobre cómo consumir las APIs de las principales redes sociales: Facebook, Instagram, WhatsApp, TikTok y LinkedIn.

---

## 📘 Facebook Graph API

### ¿Qué se puede hacer?
- Publicar posts, fotos y videos en páginas de Facebook
- Obtener información de páginas y perfiles
- Gestionar comentarios y reacciones
- Programar publicaciones
- Obtener estadísticas e insights de páginas
- Administrar eventos y anuncios

### Cómo generar el token de acceso

#### 1. Crear una App de Facebook
- Ve a [Facebook Developers](https://developers.facebook.com/)
- Haz clic en "My Apps" > "Create App"
- Selecciona el tipo de app (generalmente "Business")
- Completa la información requerida

#### 2. Configurar permisos
- En el dashboard de tu app, ve a "Tools & Support" > "Graph API Explorer"
- Selecciona tu app en el desplegable
- Agrega los permisos necesarios:
  - `pages_manage_posts` - Para publicar en páginas
  - `pages_read_engagement` - Para leer métricas
  - `pages_show_list` - Para listar páginas
  - `publish_video` - Para publicar videos

#### 3. Generar Token
- En Graph API Explorer, haz clic en "Generate Access Token"
- Autoriza los permisos solicitados
- Copia el token de acceso (este es temporal)

#### 4. Obtener un Token de Larga Duración
- Ve a "Access Token Debugger"
- Pega tu token temporal
- Haz clic en "Extend Access Token" para obtener uno de 60 días
- Para tokens permanentes, necesitas usar un token de página (no de usuario)

### Endpoints principales
- **Base URL**: `https://graph.facebook.com/v18.0/`
- **Publicar**: `POST /{page-id}/feed`
- **Obtener páginas**: `GET /me/accounts`
- **Obtener insights**: `GET /{page-id}/insights`

### Recursos
- [Documentación oficial](https://developers.facebook.com/docs/graph-api/)
- [Graph API Explorer](https://developers.facebook.com/tools/explorer/)

---

## 📷 Instagram Graph API

### ¿Qué se puede hacer?
- Publicar fotos, videos, reels y carruseles
- Obtener información de la cuenta de Instagram Business/Creator
- Gestionar comentarios
- Obtener métricas e insights
- Acceder a menciones y hashtags
- Gestionar historias (stories)

### Cómo generar el token de acceso

#### Requisitos previos
- Tener una cuenta de Instagram Business o Creator
- La cuenta debe estar vinculada a una Página de Facebook
- Usar la misma app de Facebook configurada anteriormente

#### 1. Vincular Instagram a Facebook
- Ve a tu página de Facebook
- En Configuración > Instagram > Conectar cuenta
- Autoriza la conexión con tu cuenta de Instagram

#### 2. Configurar permisos
En Graph API Explorer, necesitas:
- `instagram_basic` - Acceso básico a Instagram
- `instagram_content_publish` - Publicar contenido
- `pages_read_engagement` - Leer métricas
- `pages_show_list` - Listar páginas conectadas

#### 3. Obtener el Instagram Business Account ID
- Usa el endpoint: `GET /{facebook-page-id}?fields=instagram_business_account`
- Guarda el `instagram_business_account.id`

#### 4. Token de acceso
- Usa el mismo proceso de token de página de Facebook
- El token de la página de Facebook sirve para Instagram

### Proceso de publicación
1. **Crear contenedor de medios**: Sube el contenido
2. **Publicar contenedor**: Publica el contenido en el feed

### Endpoints principales
- **Base URL**: `https://graph.facebook.com/v18.0/`
- **Crear contenedor**: `POST /{ig-user-id}/media`
- **Publicar**: `POST /{ig-user-id}/media_publish`
- **Obtener insights**: `GET /{ig-media-id}/insights`

### Recursos
- [Documentación oficial](https://developers.facebook.com/docs/instagram-api/)
- [Guía de publicación](https://developers.facebook.com/docs/instagram-api/guides/content-publishing)

---

## 💬 WhatsApp Business API

### ¿Qué se puede hacer?
- Enviar mensajes de texto, imágenes, videos y documentos
- Enviar mensajes de plantilla (template messages)
- Recibir mensajes de clientes
- Gestionar conversaciones
- Enviar mensajes interactivos (botones, listas)
- Configurar respuestas automáticas
- Integrar chatbots

### Cómo generar el token de acceso

#### 1. Crear una App en Meta for Developers
- Ve a [Meta for Developers](https://developers.facebook.com/)
- Crea una nueva app de tipo "Business"
- Agrega el producto "WhatsApp"

#### 2. Configurar WhatsApp Business
- En el dashboard, ve a WhatsApp > "Getting Started"
- Selecciona o crea una cuenta de WhatsApp Business
- Verifica tu número de teléfono empresarial

#### 3. Obtener credenciales
- **Phone Number ID**: ID del número de teléfono de WhatsApp
- **WhatsApp Business Account ID**: ID de la cuenta empresarial
- **Access Token**: Token temporal desde la consola

#### 4. Generar Token de Sistema
- Ve a "System Users" en Business Settings
- Crea un nuevo usuario del sistema
- Genera un token con los permisos:
  - `whatsapp_business_management`
  - `whatsapp_business_messaging`

#### 5. Configurar Webhook
- Configura un webhook para recibir mensajes entrantes
- Proporciona una URL HTTPS válida
- Configura el verify token

### Limitaciones
- Necesitas aprobación para enviar mensajes a más de 1,000 usuarios
- Solo puedes iniciar conversaciones con plantillas aprobadas
- Los usuarios tienen 24 horas para responder mensajes iniciados por ellos

### Endpoints principales
- **Base URL**: `https://graph.facebook.com/v18.0/`
- **Enviar mensaje**: `POST /{phone-number-id}/messages`
- **Gestionar plantillas**: `POST /{whatsapp-business-account-id}/message_templates`

### Recursos
- [Documentación oficial](https://developers.facebook.com/docs/whatsapp/)
- [Guía de inicio rápido](https://developers.facebook.com/docs/whatsapp/cloud-api/get-started)

---

## 🎵 TikTok for Developers API

### ¿Qué se puede hacer?
- Publicar videos directamente
- Obtener información de la cuenta de usuario
- Acceder a datos de videos publicados
- Obtener estadísticas y métricas (views, likes, shares)
- Gestionar comentarios
- Realizar búsquedas de contenido

### Cómo generar el token de acceso

#### 1. Registrarse como desarrollador
- Ve a [TikTok for Developers](https://developers.tiktok.com/)
- Regístrate con tu cuenta de TikTok
- Acepta los términos de servicio

#### 2. Crear una App
- En el dashboard, haz clic en "Manage Apps"
- Crea una nueva aplicación
- Completa la información requerida

#### 3. Configurar productos
Selecciona los productos necesarios:
- **Login Kit**: Para autenticación de usuarios
- **Content Posting API**: Para publicar videos
- **Research API**: Para obtener datos analíticos

#### 4. Configurar OAuth
- Agrega tu "Redirect URI" (callback URL)
- Selecciona los scopes necesarios:
  - `user.info.basic` - Información básica
  - `video.list` - Listar videos
  - `video.upload` - Subir videos
  - `video.publish` - Publicar videos

#### 5. Implementar OAuth 2.0 Flow
1. Redirige al usuario a la URL de autorización de TikTok
2. El usuario autoriza tu aplicación
3. TikTok redirige de vuelta con un código de autorización
4. Intercambia el código por un access token

#### Proceso de autorización
```
Authorization URL:
https://www.tiktok.com/v2/auth/authorize/
?client_key={CLIENT_KEY}
&scope={SCOPES}
&response_type=code
&redirect_uri={REDIRECT_URI}

Token Exchange:
POST https://open.tiktokapis.com/v2/oauth/token/
```

#### 6. Renovar tokens
- Los access tokens expiran (generalmente en 24 horas)
- Usa el refresh token para obtener nuevos access tokens

### Proceso de publicación de videos
1. **Inicializar upload**: Obtén un upload URL
2. **Subir video**: Envía el archivo de video
3. **Publicar**: Confirma la publicación con metadatos

### Endpoints principales
- **Base URL**: `https://open.tiktokapis.com/v2/`
- **Info de usuario**: `GET /user/info/`
- **Listar videos**: `GET /video/list/`
- **Subir video**: `POST /post/publish/video/init/`

### Limitaciones
- Tamaño máximo de video: 4GB
- Duración: 3 segundos a 10 minutos
- Rate limits estrictos según el nivel de la app
- Requiere revisión de la app para producción

### Recursos
- [Documentación oficial](https://developers.tiktok.com/doc/)
- [Content Posting API](https://developers.tiktok.com/doc/content-posting-api-get-started)

---

## 💼 LinkedIn API

### ¿Qué se puede hacer?
- Publicar posts, artículos e imágenes en perfiles y páginas
- Compartir contenido en nombre de organizaciones
- Obtener información de perfil y empresa
- Acceder a métricas de posts
- Gestionar páginas de empresa
- Publicar ofertas de trabajo

### Cómo generar el token de acceso

#### 1. Crear una App de LinkedIn
- Ve a [LinkedIn Developers](https://www.linkedin.com/developers/)
- Haz clic en "Create app"
- Completa la información:
  - App name
  - LinkedIn Page (necesitas una página de empresa)
  - Privacy policy URL
  - Logo de la app

#### 2. Verificar la app
- Verifica la aplicación con tu LinkedIn Page
- Genera un "Verify URL" y agrégalo a tu página

#### 3. Solicitar acceso a productos
En la pestaña "Products", solicita acceso a:
- **Share on LinkedIn**: Para compartir contenido
- **Sign In with LinkedIn**: Para autenticación
- **Marketing Developer Platform**: Para funciones avanzadas (requiere aprobación)

#### 4. Configurar OAuth 2.0
- En "Auth" tab, configura:
  - **Redirect URLs**: URLs autorizadas para callback
  - Copia tu **Client ID** y **Client Secret**

#### 5. Obtener authorization code
Redirige al usuario a:
```
https://www.linkedin.com/oauth/v2/authorization
?response_type=code
&client_id={CLIENT_ID}
&redirect_uri={REDIRECT_URI}
&scope={SCOPES}
```

Scopes comunes:
- `r_liteprofile` - Información básica del perfil
- `r_emailaddress` - Email del usuario
- `w_member_social` - Compartir en nombre del usuario
- `w_organization_social` - Compartir en nombre de organización
- `rw_organization_admin` - Administrar páginas

#### 6. Intercambiar código por token
```
POST https://www.linkedin.com/oauth/v2/accessToken
Content-Type: application/x-www-form-urlencoded

grant_type=authorization_code
&code={AUTHORIZATION_CODE}
&redirect_uri={REDIRECT_URI}
&client_id={CLIENT_ID}
&client_secret={CLIENT_SECRET}
```

#### 7. Tokens de acceso
- Los tokens expiran en 60 días por defecto
- Puedes configurar tokens que expiren en 1 año
- No hay refresh tokens, debes repetir el flujo OAuth

### Tipos de publicación
1. **Share de texto**: Posts simples
2. **Share con imagen**: Posts con una imagen
3. **Share con múltiples imágenes**: Carrusel
4. **Share con artículo**: Link preview
5. **Share con video**: Posts con video

### Endpoints principales
- **Base URL**: `https://api.linkedin.com/v2/`
- **Info de usuario**: `GET /me`
- **Publicar como usuario**: `POST /ugcPosts`
- **Publicar como organización**: `POST /ugcPosts` (con organizationId)
- **Compartir**: `POST /shares`

### Limitaciones
- Rate limits: 500 requests por usuario por día (puede variar)
- Tamaño máximo de imagen: 10MB
- Formatos de imagen: PNG, JPG, GIF
- Videos: Hasta 5GB, proceso de upload en partes

### Recursos
- [Documentación oficial](https://docs.microsoft.com/linkedin/)
- [Share on LinkedIn](https://docs.microsoft.com/linkedin/consumer/integrations/self-serve/share-on-linkedin)
- [Marketing API](https://docs.microsoft.com/linkedin/marketing/)

---

## 🔐 Mejores Prácticas de Seguridad

### Gestión de Tokens
1. **Nunca expongas tokens en el código frontend**
   - Usa variables de entorno
   - Almacena en backend seguro

2. **Rotación regular de tokens**
   - Renueva tokens antes de expiración
   - Implementa mecanismos de refresh

3. **Almacenamiento seguro**
   - Usa servicios de gestión de secretos
   - Encripta tokens en base de datos

4. **Validación de permisos**
   - Solicita solo los permisos necesarios
   - Verifica scopes antes de cada operación

### Rate Limiting
- Implementa caché para reducir llamadas
- Usa colas para programar publicaciones
- Monitorea límites de la API
- Implementa exponential backoff en reintentos

### Webhooks
- Valida firmas de webhooks
- Usa HTTPS obligatoriamente
- Implementa verificación de origen
- Procesa eventos de manera asíncrona

---

## 📊 Comparación Rápida

| Plataforma | Complejidad | Aprobación Requerida | Expiración Token |
|------------|-------------|----------------------|------------------|
| Facebook   | Media       | No                   | 60 días (página) |
| Instagram  | Media       | No                   | 60 días (página) |
| WhatsApp   | Alta        | Sí (para producción)| No expira (sistema)|
| TikTok     | Alta        | Sí (para producción)| 24 horas        |
| LinkedIn   | Media       | Sí (productos)      | 60 días         |

---

## 🚀 Pasos Generales de Integración

1. **Registro**: Crea cuenta de desarrollador en cada plataforma
2. **Crear App**: Genera aplicación en el portal de desarrolladores
3. **Configuración**: Define permisos, callbacks y webhooks
4. **OAuth Flow**: Implementa autenticación de usuarios
5. **Testing**: Prueba en modo sandbox/desarrollo
6. **Aprobación**: Solicita revisión si es necesario
7. **Producción**: Despliega con tokens de producción
8. **Monitoreo**: Implementa logs y alertas

---

## ⚠️ Consideraciones Importantes

### Cumplimiento y Políticas
- Lee y cumple las políticas de cada plataforma
- Respeta límites de automatización
- No hagas spam ni contenido no autorizado
- Informa a usuarios sobre uso de sus datos

### Mantenimiento
- Las APIs cambian frecuentemente
- Mantén actualizada la versión de la API
- Suscríbete a newsletters de desarrolladores
- Monitorea deprecaciones

### Testing
- Usa cuentas de prueba cuando estén disponibles
- No publiques contenido de prueba en cuentas reales
- Implementa flags de desarrollo/producción

---

## 📚 Recursos Adicionales

### Herramientas útiles
- **Postman**: Para probar endpoints
- **ngrok**: Para exponer localhost para webhooks
- **Insomnia**: Cliente REST alternativo
- **Graph API Explorer**: Para Facebook/Instagram

### Comunidades
- Stack Overflow con tags específicos de cada plataforma
- Foros oficiales de desarrolladores
- GitHub para ejemplos de código
- Discord/Slack de comunidades de desarrolladores

---

**Nota**: Esta guía se basa en la información disponible hasta noviembre de 2025. Las APIs y procesos pueden cambiar. Siempre consulta la documentación oficial más reciente de cada plataforma.
