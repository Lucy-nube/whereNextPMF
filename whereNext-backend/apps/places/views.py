from django.shortcuts import render
from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.authentication import JWTAuthentication
from django.db.models import Q
from django.shortcuts import get_object_or_404

from .models import Place
from .serializers import PlaceSerializer

from rest_framework import viewsets, filters, status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.authentication import JWTAuthentication
from django_filters.rest_framework import DjangoFilterBackend

from .models import Place
from .serializers import PlaceSerializer


from rest_framework import viewsets, filters, status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.authentication import JWTAuthentication
from django_filters.rest_framework import DjangoFilterBackend

from .models import Place
from .serializers import PlaceSerializer


class PlaceViewSet(viewsets.ModelViewSet):
    queryset = Place.objects.all()
    serializer_class = PlaceSerializer
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]

    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ["category"]
    search_fields = ["name", "city", "country"]

    def list(self, request, *args, **kwargs):
        # ============================================================
        # 1) FILTRAR OFFICIAL PLACES USANDO DRF FILTERS
        # ============================================================
        official_qs = Place.objects.filter(is_official=True)
        official_qs = self.filter_queryset(official_qs)

        serializer = self.get_serializer(official_qs, many=True)
        data = list(serializer.data)

        # ============================================================
        # 2) AGREGAR TRIPS PÚBLICOS COMO "PLACES"
        # ============================================================
        try:
            from apps.trips.models import Trip

            public_trips = Trip.objects.filter(is_public=True).select_related(
                "owner", "owner__profile"
            ).prefetch_related("photos")

            requested_category = request.query_params.get("category", None)
            requested_search = request.query_params.get("search", None)

            for trip in public_trips:

                # 🔥 FILTRO POR CATEGORY
                if requested_category and trip.mood != requested_category:
                    continue

                # 🔥 FILTRO POR SEARCH
                if requested_search and requested_search.lower() not in trip.title.lower():
                    continue

                first_photo = trip.photos.first()
                photo_url = first_photo.image.url if first_photo else None

                trip_as_place = {
                    "id": f"trip-{trip.id}",
                    "name": trip.title,
                    "description": trip.description or "",
                    "city": "",
                    "country": trip.destination or "",
                    "category": trip.mood or "CITY",
                    "image_url": photo_url or "",
                    "is_official": False,
                    "verified": False,
                    "created_at": trip.created_at.isoformat() if trip.created_at else None,
                    "likes": list(trip.likes.values_list("id", flat=True)),
                    "owner": {
                        "id": trip.owner.id,
                        "username": trip.owner.username,
                        "avatar": (
                            trip.owner.profile.avatar.url
                            if trip.owner.profile.avatar
                            else None
                        ),
                    },
                }

                data.append(trip_as_place)

        except Exception as e:
            print(f"🔬 Relational blending alert (Handled safely): {e}")

        return Response(data, status=status.HTTP_200_OK)
