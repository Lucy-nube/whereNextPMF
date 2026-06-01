from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.authentication import JWTAuthentication
from django.db.models import Q
from django.shortcuts import get_object_or_404

from .models import Place

from rest_framework import viewsets, filters, status
from django_filters.rest_framework import DjangoFilterBackend

from rest_framework.views import APIView
from rest_framework import status
from .serializers import PlaceSerializer, PlaceCommentSerializer




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
        # SOLO PLACES OFICIALES
        # ============================================================
        official_qs = Place.objects.filter(is_official=True)

        # filtros seguros
        category = request.query_params.get("category")
        search = request.query_params.get("search")

        if category:
            official_qs = official_qs.filter(category__iexact=category)

        if search:
            official_qs = official_qs.filter(name__icontains=search)

        serializer = self.get_serializer(official_qs, many=True)

        return Response(serializer.data, status=status.HTTP_200_OK)
    

class PlaceCommentCreateView(APIView):
    def post(self, request, place_id):
        try:
            place = Place.objects.get(id=place_id)
        except Place.DoesNotExist:
            return Response({"detail": "Place not found"}, status=404)

        serializer = PlaceCommentSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(place=place, user=request.user)
            return Response(serializer.data, status=201)

        return Response(serializer.errors, status=400)
    

class PlaceLikeToggleView(APIView):
    def post(self, request, place_id):
        try:
            place = Place.objects.get(id=place_id)
        except Place.DoesNotExist:
            return Response({"detail": "Place not found"}, status=404)

        user = request.user

        if user in place.likes.all():
            place.likes.remove(user)
            return Response({"liked": False}, status=200)
        else:
            place.likes.add(user)
            return Response({"liked": True}, status=200)

class PlaceRateView(APIView):
    def post(self, request, place_id):
        try:
            place = Place.objects.get(id=place_id)
        except Place.DoesNotExist:
            return Response({"detail": "Place not found"}, status=404)

        rating = request.data.get("rating")

        if rating is None:
            return Response({"detail": "Rating required"}, status=400)

        
        return Response({"message": "Rating received", "rating": rating}, status=201)

