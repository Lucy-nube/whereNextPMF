from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework import viewsets, filters, status
from rest_framework.response import Response
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework.permissions import AllowAny, IsAuthenticated
from django.db.models import Q
from django.shortcuts import get_object_or_404

from .models import Place


from django_filters.rest_framework import DjangoFilterBackend
from .serializers import PlaceSerializer, PlaceCommentSerializer
from .models import FavoritePlace

from rest_framework import generics




class PlaceViewSet(viewsets.ModelViewSet):
    queryset = Place.objects.all()
    serializer_class = PlaceSerializer
    authentication_classes = [JWTAuthentication]

    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ["category"]
    search_fields = ["name", "city", "country"]

    def get_permissions(self):
        if self.action in ["list", "retrieve"]:
            return [AllowAny()]
        return [IsAuthenticated()]

    def list(self, request, *args, **kwargs):

        # ============================================================
        # TODOS LOS PLACES (ya no filtramos por is_official)
        # ============================================================
        qs = Place.objects.all()

        # filtros seguros
        category = request.query_params.get("category")
        search = request.query_params.get("search")

        if category:
            qs = qs.filter(category__iexact=category)

        if search:
            qs = qs.filter(name__icontains=search)

        serializer = self.get_serializer(qs, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)


    @action(detail=True, methods=["post"])
    def favorite(self, request, pk=None):
     place = self.get_object()
     user = request.user

     fav, created = FavoritePlace.objects.get_or_create(
         user=user,
         place=place
     )

     if not created:
         fav.delete()
         return Response({"favorited": False})

     return Response({"favorited": True})






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



class FavoritePlacesListView(generics.ListAPIView):
    serializer_class = PlaceSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return (
            Place.objects
            .filter(favoriteplace__user=self.request.user)
            .select_related("created_by")
        )
        
        
