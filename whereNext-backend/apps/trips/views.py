from rest_framework import viewsets, permissions, generics, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.exceptions import PermissionDenied

from django.db import models
from django.db.models import Q
from django.shortcuts import get_object_or_404

from apps.trips.models import Trip, TripPhoto, TripComment, TripPlace
from apps.social.companions.models import Companion
from apps.places.models import Place
from apps.social.notifications.models import Notification

from .serializers import (
    TripSerializer,
    TripPlaceSerializer,
    ReorderTripPlacesSerializer,
    TripPhotoSerializer,
    TripCommentSerializer
)


# =========================================================
# TRIP VIEWSET (🚀 FULLY INTEGRATED & MATCHED ACTIONS)
# =========================================================
class TripViewSet(viewsets.ModelViewSet):
    serializer_class = TripSerializer
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Trip.objects.filter(
            Q(owner=self.request.user) | Q(is_public=True)
        ).select_related("owner", "owner__profile").order_by("-created_at")

    # ============================================================
    # 📸 SUBIR FOTOS A UN VIAJE → /api/trips/<id>/photos/
    # ============================================================
    @action(
        detail=True,
        methods=["post"],
        parser_classes=[MultiPartParser, FormParser]
    )
    def photos(self, request, pk=None):
        trip = self.get_object()

        image = request.FILES.get("image")
        caption = request.data.get("caption", "")

        if not image:
            return Response({"error": "No se envió ninguna imagen."},
                            status=status.HTTP_400_BAD_REQUEST)

        photo = TripPhoto.objects.create(
            trip=trip,
            image=image,
            caption=caption
        )

        return Response({
            "id": photo.id,
            "image": photo.image.url,
            "caption": photo.caption,
            "created_at": photo.created_at
        }, status=status.HTTP_201_CREATED)

    # ============================================================
    # 🧭 CREAR VIAJE + INVITACIONES
    # ============================================================
    def perform_create(self, serializer):
     raw_data = self.request.data
     trip_type = raw_data.get("trip_type", "solo")

     # ============================================================
     # 👥 MANEJO DE CO-TRAVELER PARA TRIP TYPE "COUPLE"
     # ============================================================
     co_traveler_id = None
     if trip_type == "couple":
        invited_list = raw_data.get("invited_companions", [])
        if isinstance(invited_list, list) and len(invited_list) > 0:
            co_traveler_id = invited_list[0]

     # ============================================================
     # 🧭 CREAR EL VIAJE
     # ============================================================
     trip = serializer.save(
        trip_type=trip_type,
        co_traveler_id=co_traveler_id
     )

     # ============================================================
     # 📸 GUARDAR FOTOS ENVIADAS DESDE EL FRONTEND
     # ============================================================
     photos_data = raw_data.get("photos", [])

    # El frontend envía: [{ "image": "/media/places/tokyo.jpg", "caption": "..." }]
     if isinstance(photos_data, list):
        for photo in photos_data:
            image_path = photo.get("image")
            caption = photo.get("caption", "")

            if image_path:
                TripPhoto.objects.create(
                    trip=trip,
                    image=image_path,   # ⭐ Acepta rutas existentes
                    caption=caption
                )



    # ============================================================
    # ❤️ LISTAR LIKES
    # ============================================================
    @action(detail=True, methods=["get"])
    def likes(self, request, pk=None):
        trip = self.get_object()
        liking_users = trip.likes.select_related("profile").all()

        return Response([
            {
                "id": u.id,
                "username": u.username,
                "avatar": (
                    u.profile.avatar.url
                    if hasattr(u, "profile") and u.profile.avatar
                    else None
                )
            }
            for u in liking_users
        ], status=status.HTTP_200_OK)
    

    # ============================================================
    # 👍 LIKE / UNLIKE VIAJE
    # ============================================================
    @action(detail=True, methods=["post"])
    def like(self, request, pk=None):
     trip = self.get_object()
     user = request.user

     # Alternar like
     if user in trip.likes.all():
        trip.likes.remove(user)
        liked = False
     else:
        trip.likes.add(user)
        liked = True
      
        # ⭐ Crear notificación
        if trip.owner != user:
            Notification.objects.create(
                user=trip.owner,
                from_user=user,
                notification_type="LIKE",
                text_preview=f"{user.username} le dio like a tu viaje")
            
     return Response({
        "liked": liked,
        "total_likes": trip.likes.count()
     }, status=status.HTTP_200_OK)

    # ============================================================
    # 💬 COMENTAR VIAJE
    # ============================================================
    @action(detail=True, methods=["post"])
    def comment(self, request, pk=None):
        trip = self.get_object()
        text = request.data.get("text", "").strip()

        if not text:
            return Response({"error": "El comentario no puede estar vacío"},
                            status=status.HTTP_400_BAD_REQUEST)

        comment = TripComment.objects.create(
            user=request.user,
            trip=trip,
            text=text
        )

        if trip.owner != request.user:
            Notification.objects.create(
                user=trip.owner,
                from_user=request.user,
                notification_type="COMMENT",
                text_preview=text[:40]
            )

        return Response(
            TripCommentSerializer(comment).data,
            status=status.HTTP_201_CREATED
        )


# =========================================================
# TRIP PLACE VIEWSET
# =========================================================
class TripPlaceViewSet(viewsets.ModelViewSet):
    serializer_class = TripPlaceSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return TripPlace.objects.filter(trip__owner=self.request.user)


# =========================================================
# NESTED ENDPOINT
# =========================================================
class TripPlacesListCreateView(generics.ListCreateAPIView):
    serializer_class = TripPlaceSerializer
    permission_classes = [IsAuthenticated]

    def get_trip(self):
        trip = get_object_or_404(Trip, id=self.kwargs["trip_id"])
        user = self.request.user

        if trip.owner != user and (hasattr(trip, 'co_travelers') and user not in trip.co_travelers.all()):
            raise PermissionDenied("No tienes acceso a este viaje.")
        return trip

    def get_queryset(self):
        trip = self.get_trip()
        return TripPlace.objects.filter(trip=trip).order_by("-id")

    def perform_create(self, serializer):
        trip = self.get_trip()
        serializer.save(trip=trip)


# =========================================================
# REORDER TRIP PLACES
# =========================================================
class ReorderTripPlacesView(APIView):
    permission_classes = [IsAuthenticated]

    def patch(self, request, trip_id):
        try:
            trip = Trip.objects.get(id=trip_id, owner=request.user)
        except Trip.DoesNotExist:
            return Response({"error": "Trip not found"}, status=status.HTTP_404_NOT_FOUND)

        serializer = ReorderTripPlacesSerializer(data=request.data)

        if serializer.is_valid():
            result = serializer.save(trip=trip)
            return Response(result, status=status.HTTP_200_OK)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# =========================================================
# EXPLORE
# =========================================================
class ExploreTripsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        trips = Trip.objects.filter(
            is_public=True
        ).exclude(
            owner=request.user
        ).select_related("owner", "owner__profile").order_by("-created_at")

        return Response([
            {
                "id": t.id,
                "title": t.title,
                "description": t.description,
                "owner": {
                    "id": t.owner.id,
                    "username": t.owner.username,
                    "avatar": (
                        t.owner.profile.avatar.url
                        if hasattr(t.owner, "profile") and t.owner.profile.avatar
                        else None
                    ),
                },
                "created_at": t.created_at,
            }
            for t in trips
        ])


# =========================================================
# FEED (🚀 FINALIZED & TRANSLATED BOTH FOR FRONTEND CAPABILITIES)
# =========================================================
class FeedTripsView(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user

        friends_as_user = Companion.objects.filter(
            user=user, status__iexact="ACCEPTED"
        ).values_list('companion_id', flat=True)

        friends_as_companion = Companion.objects.filter(
            companion=user, status__iexact="ACCEPTED"
        ).values_list('user_id', flat=True)

        friend_ids = list(friends_as_user) + list(friends_as_companion)

        trips = Trip.objects.filter(
            models.Q(owner__id__in=friend_ids) |
            models.Q(is_public=True, owner__profile__is_private=False) |
            models.Q(owner=user, is_public=True)
        ).select_related("owner", "owner__profile").prefetch_related(
            "photos", "likes", "comments", "comments__user"
        ).order_by("-created_at")

        return Response([
            {
                "id": t.id,
                "title": t.title,
                "description": t.description,
                "created_at": t.created_at,
                "destination": t.destination or "",
                "mood": t.mood or "",

                # ⭐ DUAL COMPATIBILITY KEY MAPS: Feeds both keys to keep Home.jsx rendering without crash flags
                "is_liked": t.likes.filter(id=user.id).exists(),
                "liked_by_me": t.likes.filter(id=user.id).exists(),
                
                "total_likes": t.likes.count(),
                "likes_count": t.likes.count(),

                "owner": {
                    "id": t.owner.id,
                    "username": t.owner.username,
                    "avatar": (
                        t.owner.profile.avatar.url
                        if hasattr(t.owner, "profile") and t.owner.profile.avatar
                        else None
                    ),
                },

                "photos": [
                    {
                        "id": p.id,
                        "image": p.image.url if p.image else "",
                        "caption": p.caption or ""
                    }
                    for p in t.photos.all()
                ],

                # 🚀 REPAIRED: Fully closed comments array dictionary pass loop without truncations
                "comments_list": [
                    {
                        "id": c.id,
                        "text": c.text,
                        "user": {
                            "username": c.user.username
                        }
                    }
                    for c in t.comments.all()
                ]
            }
            for t in trips
        ], status=status.HTTP_200_OK)

# Append this to the absolute bottom of apps/trips/views.py

# =========================================================
# 🌍 PUBLIC TRIP DETAILS VIEW (Restored & Optimized)
# =========================================================
class TripDetailPublicView(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request, trip_id):
        # Fetch trip ensuring optimized lookups for associated owners and copilots
        trip = get_object_or_404(Trip.objects.select_related("owner", "co_traveler"), id=trip_id)

        # Security check: If private, restrict strictly to the owner or validated companion connections
        if not trip.is_public and trip.owner != request.user:
            is_friend = Companion.objects.filter(
                Q(user=request.user, companion=trip.owner, status__iexact="ACCEPTED") |
                Q(user=trip.owner, companion=request.user, status__iexact="ACCEPTED")
            ).exists()
            if not is_friend:
                raise PermissionDenied("No tienes acceso a este pasaporte de viaje privado.")

        return Response({
            "id": trip.id,
            "title": trip.title,
            "description": trip.description,
            "created_at": trip.created_at,
            "destination": trip.destination or "",
            "mood": trip.mood or "",
            "start_date": trip.start_date,
            "end_date": trip.end_date,
            "is_public": trip.is_public,
            "trip_type": getattr(trip, "trip_type", "solo"),
            "co_traveler": trip.co_traveler.id if trip.co_traveler else None,
            "co_traveler_username": trip.co_traveler.username if trip.co_traveler else "",
            "owner": {
                "id": trip.owner.id,
                "username": trip.owner.username,
                "avatar": trip.owner.profile.avatar.url if hasattr(trip.owner, "profile") and trip.owner.profile.avatar else None,
            },
            "photos": [
                {
                    "id": p.id, 
                    "image": p.image.url if p.image else "", 
                    "caption": p.caption or ""
                }
                for p in trip.photos.all()
            ],
            "trip_places": [
                {
                    "id": tp.id,
                    "day": tp.day,
                    "order": tp.order,
                    "notes": tp.notes,
                    "place": {
                        "id": tp.place.id,
                        "name": tp.place.name,
                        "country": tp.place.country,
                    }
                }
                for tp in trip.trip_places.all()
            ]
        }, status=status.HTTP_200_OK)
    

# Añade esto al final absoluto de apps/trips/views.py

# =========================================================
# 📷 TRIP PHOTO UPLOAD VIEW (Restaurado y Optimizado)
# =========================================================
class TripPhotoUploadView(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]
    
    # Inyectamos los parsers estándar de Django para procesar flujos de archivos binarios (Multipart)
    parser_classes = [MultiPartParser, FormParser]

    def post(self, request, trip_id):
        # Localizamos el itinerario correspondiente
        trip = get_object_or_404(Trip, id=trip_id)

        # Filtro de seguridad perimetral de autoría
        if trip.owner != request.user:
            raise PermissionDenied("No puedes subir recuerdos multimedia al pasaporte de viaje de otra persona.")

        image_file = request.FILES.get("image")
        caption = request.data.get("caption", "").strip()

        if not image_file:
            return Response({"error": "No se proporcionó ninguna imagen válida o archivo binario"}, status=400)

        # Creamos el registro en la base de datos SQLite mapeado con tu modelo real
        photo = TripPhoto.objects.create(
            trip=trip,
            image=image_file,
            caption=caption
        )

        return Response({
            "id": photo.id,
            "image": photo.image.url,
            "caption": photo.caption,
            "created_at": photo.created_at
        }, status=status.HTTP_201_CREATED)

# Añade este bloque al final absoluto de apps/trips/views.py

# =========================================================
# 🧭 TRIP SUGGESTIONS VIEW (Recomendaciones Inteligentes)
# =========================================================



class TripSuggestionsView(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request, trip_id):
        trip = get_object_or_404(Trip, id=trip_id)

        # 🔍 Búsqueda flexible por mood
        mood = trip.mood or ""
        destination = trip.destination or ""

        suggested_places = Place.objects.filter(
            Q(category__icontains=mood) |
            Q(tags__icontains=mood) |
            Q(country__icontains=destination)
        ).distinct()

        # ❌ Excluir lugares ya añadidos al itinerario
        existing_ids = TripPlace.objects.filter(trip=trip).values_list("place_id", flat=True)
        if existing_ids:
            suggested_places = suggested_places.exclude(id__in=existing_ids)

        # Limitar a 6
        final_suggestions = suggested_places[:6]

        # Serialización segura
        return Response([
           {
    "id": p.id,
    "name": p.name,
    "quiet_score": "Recomendado" if p.verified else "Tranquilo",
    "country": p.country,
    "description": p.description,
    "image": p.image.url if p.image else None,   
    "category": p.category,                      
}

            for p in final_suggestions
        ], status=status.HTTP_200_OK)
