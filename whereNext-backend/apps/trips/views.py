from rest_framework import viewsets, permissions, generics, status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.exceptions import PermissionDenied
from rest_framework import status

from django.db import models
from django.db.models import Q
from django.shortcuts import get_object_or_404

from .models import Trip, TripPlace, TripPhoto ,TripComment
from apps.users.models import Companion
from apps.places.models import Place

from .serializers import (
    TripSerializer,
    TripPlaceSerializer,
    ReorderTripPlacesSerializer,
    TripPhotoSerializer
)


# =========================================================
# TRIP VIEWSET (Optimizado para perfiles públicos de React)
# =========================================================
class TripViewSet(viewsets.ModelViewSet):
    serializer_class = TripSerializer
    authentication_classes = [JWTAuthentication]
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        # 🚀 CORRECCIÓN CLAVE: Permite listar tus propios viajes Y viajes públicos
        # de otros usuarios, previniendo errores 403 / 404 al navegar en perfiles ajenos.
        return Trip.objects.filter(
            Q(owner=self.request.user) | Q(is_public=True)
        ).order_by("-created_at")

    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)

    def perform_update(self, serializer):
        trip = self.get_object()

        if trip.owner != self.request.user:
            raise PermissionDenied("You cannot edit someone else's trip.")

        if "trip_places" in self.request.data:
            raise PermissionDenied(
                "TripPlaces cannot be updated from Trip. Use TripPlace endpoint."
            )

        serializer.save()

    def perform_destroy(self, instance):
        if instance.owner != self.request.user:
            raise PermissionDenied("You cannot delete someone else's trip.")

        instance.delete()


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

    def get_queryset(self):
        trip_id = self.kwargs["trip_id"]

        return TripPlace.objects.filter(
            trip_id=trip_id,
            trip__owner=self.request.user
        )

    def perform_create(self, serializer):
        trip = Trip.objects.get(
            id=self.kwargs["trip_id"],
            owner=self.request.user
        )
        serializer.save(trip=trip)


# =========================================================
# REORDER TRIP PLACES
# =========================================================
class ReorderTripPlacesView(APIView):
    permission_classes = [IsAuthenticated]

    def patch(self, request, trip_id):

        try:
            trip = Trip.objects.get(
                id=trip_id,
                owner=request.user
            )
        except Trip.DoesNotExist:
            return Response(
                {"error": "Trip not found"},
                status=status.HTTP_404_NOT_FOUND
            )

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
        ).select_related("owner").order_by("-created_at")

        return Response([
            {
                "id": t.id,
                "title": t.title,
                "description": t.description,
                "owner": {
                    "id": t.owner.id,
                    "username": t.owner.username,
                    "avatar": t.owner.profile.avatar.url if hasattr(t.owner, 'profile') and t.owner.profile.avatar else None,
                },
                "created_at": t.created_at,
            }
            for t in trips
        ])


# =========================================================
# FEED (FIXED + SOLO FRIENDS ACCEPTED)
# =========================================================
class FeedTripsView(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user

        # 1. Extraemos los IDs de tus amigos aceptados
        friends_as_user = Companion.objects.filter(user=user, status__iexact="ACCEPTED").values_list('companion_id', flat=True)
        friends_as_companion = Companion.objects.filter(companion=user, status__iexact="ACCEPTED").values_list('user_id', flat=True)
        friend_ids = list(friends_as_user) + list(friends_as_companion)

        # 2. Query con optimización de rendimiento (prefetch_related para traer las fotos de golpe)
        trips = Trip.objects.filter(
            models.Q(owner__id__in=friend_ids) |
            models.Q(is_public=True, owner__profile__is_private=False) |
            models.Q(owner=user, is_public=True)
        ).select_related("owner").prefetch_related("photos", "likes").order_by("-created_at")

        # 3. Respuesta JSON completa con Multimedia y Social Matrix
              # 🚀 RETORNO CON DOBLE COMPROBACIÓN DE AVATAR (User o Profile)
        return Response([
            {
                "id": t.id,
                "title": t.title,
                "description": t.description,
                "created_at": t.created_at,
                "destination": t.destination or "",
                "mood": t.mood or "",
                "is_liked": t.likes.filter(id=user.id).exists(),
                "total_likes": t.likes.count(),
                "owner": {
                    "id": t.owner.id,
                    "username": t.owner.username,
                    # ⚡ BUSCADOR INTELIGENTE DE AVATAR MULTI-TABLA:
                    "avatar": t.owner.avatar.url if t.owner.avatar else (
                        t.owner.profile.avatar.url if hasattr(t.owner, 'profile') and t.owner.profile and t.owner.profile.avatar else None
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
                "comments_list": [
                    {
                        "id": c.id,
                        "text": c.text,
                        "user": {"username": c.user.username}
                    }
                    for c in t.comments.select_related("user").order_by("created_at")
                ]
            }
            for t in trips
        ], status=status.HTTP_200_OK)





# =========================================================
# PUBLIC TRIP DETAILS (Arreglado y Completado sin Cortes)
# =========================================================
# Locate TripDetailPublicView inside apps/trips/views.py and update its return Response dictionary:
class TripDetailPublicView(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request, trip_id):
        try:
            # Added select_related for co_traveler to prevent performance leak overheads
            trip = Trip.objects.select_related("owner", "co_traveler").get(id=trip_id)
        except Trip.DoesNotExist:
            return Response({"error": "Trip not found"}, status=404)

        # Companion validation check logic blocks remain completely untouched here...
        if not trip.is_public and trip.owner != request.user:
            is_friend = Companion.objects.filter(
                Q(user=request.user, companion=trip.owner, status="ACCEPTED") |
                Q(user=trip.owner, companion=request.user, status="ACCEPTED")
            ).exists()
            if not is_friend:
                return Response({"error": "Not allowed"}, status=403)

        # 🚀 FORCED SYNC: Expose the missing fields directly inside your dictionary payload return tree
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
            
            # =========================================================================
            # 🚀 NEW MAP CODES: Exposing fields to make React render conditional fields
            # =========================================================================
            "trip_type": trip.trip_type,
            "co_traveler": trip.co_traveler.id if trip.co_traveler else None,
            "co_traveler_username": trip.co_traveler.username if trip.co_traveler else "",

            "owner": {
                "id": trip.owner.id,
                "username": trip.owner.username,
                "avatar": trip.owner.avatar.url if trip.owner.avatar else None,
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


# =========================================================
# TRIP PHOTO UPLOAD
# =========================================================
class TripPhotoUploadView(generics.CreateAPIView):
    queryset = TripPhoto.objects.all()
    serializer_class = TripPhotoSerializer
    parser_classes = [MultiPartParser, FormParser]


# =========================================================
# TRIP SUGGESTIONS VIEW
# =========================================================
# =========================================================
# TRIP SUGGESTIONS VIEW
# =========================================================
class TripSuggestionsView(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request, trip_id):

        trip = get_object_or_404(Trip, id=trip_id)

        mood_to_category = {
            "naturaleza": "NATURE",
            "silencio": "NATURE",
            "cafes": "FOOD",
            "lectura": "MUSEUM",
            "miradores": "BEACH",
            "ciudades": "CITY"
        }

        current_mood = (trip.mood or "").strip().lower()

        target_category = mood_to_category.get(
            current_mood,
            "CITY"
        )

        suggested_places = Place.objects.filter(
            category__iexact=target_category
        ).order_by("-created_at")[:5]

        return Response(
            {
                "suggested_places": [
                    {
                        "id": p.id,
                        "name": p.name,
                        "quiet_score": (
                            "Recomendado"
                            if p.verified
                            else "Tranquilo"
                        ),
                        "country": p.country,
                        "description": p.description,
                    }
                    for p in suggested_places
                ]
            },
            status=status.HTTP_200_OK
        )
    
class TripLikeToggleView(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]

    def post(self, request, trip_id):
        trip = get_object_or_404(Trip, id=trip_id)
        user = request.user
        if trip.likes.filter(id=user.id).exists():
            trip.likes.remove(user)
            liked = False
        else:
            trip.likes.add(user)
            liked = True
        return Response({"liked": liked, "total_likes": trip.likes.count()}, status=status.HTTP_200_OK)

class TripCommentView(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request, trip_id):
        trip = get_object_or_404(Trip, id=trip_id)
        comments = trip.comments.select_related("user").order_by("created_at")
        return Response([
            {
                "id": c.id,
                "text": c.text,
                "created_at": c.created_at,
                "user": {
                    "id": c.user.id,
                    "username": c.user.username,
                    "avatar": c.user.avatar.url if c.user.avatar else None
                }
            }
            for c in comments
        ], status=status.HTTP_200_OK)

    def post(self, request, trip_id):
        trip = get_object_or_404(Trip, id=trip_id)
        text = request.data.get("text", "").strip()
        if not text:
            return Response({"error": "El comentario no puede estar vacío"}, status=400)
        
        comment = TripComment.objects.create(trip=trip, user=request.user, text=text)
        return Response({
            "id": comment.id,
            "text": comment.text,
            "created_at": comment.created_at,
            "user": {
                "id": request.user.id,
                "username": request.user.username,
                "avatar": request.user.avatar.url if request.user.avatar else None
            }
        }, status=status.HTTP_201_CREATED)