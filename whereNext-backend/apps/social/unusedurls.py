from django.urls import path, include

urlpatterns = [

    # =========================
    # 💬 CHATS
    # =========================
    path("chats/", include("apps.social.chats.urls")),

    # =========================
    # 📩 INVITES
    # =========================
    path("invites/", include("apps.social.invites.urls")),

    # =========================
    # 🔔 NOTIFICATIONS (si existe)
    # =========================
    path("notifications/", include("apps.social.notifications.urls")),
]
