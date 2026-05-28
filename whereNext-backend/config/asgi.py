import os
from django.core.asgi import get_asgi_application
from channels.routing import ProtocolTypeRouter, URLRouter

# 🚀 MULTI-VERSION AUTOMATED IMPORT OVERRIDE GATEWAY
# Dynamically tests both Channels API major layouts to permanently bypass the compile exception
try:
    from channels.routing import AllowedHostsOriginValidator
except ImportError:
    from channels.security.websocket import AllowedHostsOriginValidator

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django_asgi_app = get_asgi_application()

# Safe application routing paths import mapping (Adjust target sub-app path if needed)
from apps.social.chats.routing import websocket_urlpatterns

# 🛡️ THE UVICORN LOOKUP ANCHOR: This absolute top-level mapping definition parameter 
# MUST be named exactly 'application' so your ASGI server can hook and execute it.
application = ProtocolTypeRouter({
    # Conventional REST HTTP data communication passes here
    "http": django_asgi_app,
    
    # Real-time asynchronous text bubbles channel retransmission stream pass
    "websocket": AllowedHostsOriginValidator(
        URLRouter(websocket_urlpatterns)
    ),
})
