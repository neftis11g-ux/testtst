# elchetv

App estilo TikTok con feed, perfil, subida de videos y LIVE real con WebRTC + Socket.IO.

## Requisitos

- Node.js 18+

## Ejecutar

```bash
npm install
npm start
```

Abrir:

- `http://localhost:3000`

## Probar LIVE real

1. Abrir `http://localhost:3000` en un navegador (host).
2. Crear perfil y pulsar `LIVE` -> `Configurar LIVE`.
3. Iniciar LIVE y aceptar permisos de camara/microfono.
4. Abrir otra ventana/navegador/dispositivo en la misma URL (viewer).
5. Ir a pestaña `LIVE` y pulsar `Unirse LIVE`.

## Notas tecnicas

- El streaming es real usando WebRTC peer-to-peer.
- Para produccion publica se recomienda HTTPS y servidor TURN para mejorar conectividad en redes estrictas.

Config TURN opcional por variables de entorno:

```bash
TURN_URL=turn:tu-turn:3478
TURN_USERNAME=usuario_turn
TURN_CREDENTIAL=clave_turn
```

## Deploy recomendado

Como ahora hay backend Node + Socket.IO, usa un host que soporte WebSocket:

- Render (plan free)
- Railway (plan free con limites)
- Fly.io (segun creditos vigentes)

## Subir a Netlify (frontend) + Render (backend LIVE)

Netlify sirve muy bien el frontend, pero el servidor Socket.IO para LIVE debes dejarlo en un host Node (por ejemplo Render).

### 1) Backend en Render

1. Sube este proyecto a GitHub.
2. En Render crea un `Web Service` desde ese repo.
3. Configura:
   - Build Command: `npm install`
   - Start Command: `npm start`
4. Deploy y guarda la URL, por ejemplo:
   - `https://elchetv-live.onrender.com`

### 2) Frontend en Netlify

1. En este repo edita `config.js`:

```js
window.ELCHETV_SOCKET_URL = "https://elchetv-live.onrender.com";
window.ELCHETV_SOCKET_PATH = "/socket.io";
```

2. En Netlify:
   - `Add new site` -> `Import an existing project`
   - Conecta el repo
   - Build command: vacio
   - Publish directory: `.`
3. Deploy.

### 3) Verificar

1. Abre la URL de Netlify en dos navegadores/dispositivos.
2. Inicia LIVE en uno y en el otro pulsa `Unirse LIVE`.
