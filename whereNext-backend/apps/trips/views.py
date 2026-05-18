from rest_framework import viewsets, permissions, generics, status
from rest_framework.exceptions import PermissionDenied
from rest_framework.views import APIView
from rest_framework.response import Response

from .models import Trip, TripPlace
from .serializers import (
    TripSerializer,
    TripPlaceSerializer,
    ReorderTripPlacesSerializer
)


# =========================================================
# TRIP VIEWSET
# =========================================================
class TripViewSet(viewsets.ModelViewSet):

    serializer_class = TripSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Trip.objects.filter(owner=self.request.user)

    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)

    def perform_update(self, serializer):

        trip = self.get_object()

        if trip.owner != self.request.user:
            raise PermissionDenied(
                "You cannot edit someone else's trip."
            )

        if "trip_places" in self.request.data:
            raise PermissionDenied(
                "TripPlaces cannot be updated from Trip. "
                "Use the TripPlace endpoint."
            )

        serializer.save()

    def perform_destroy(self, instance):

        if instance.owner != self.request.user:
            raise PermissionDenied(
                "You cannot delete someone else's trip."
            )

        instance.delete()


# =========================================================
# TRIP PLACE VIEWSET
# =========================================================
class TripPlaceViewSet(viewsets.ModelViewSet):

    serializer_class = TripPlaceSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return TripPlace.objects.filter(
            trip__owner=self.request.user
        )


# =========================================================
# NESTED ENDPOINT
# /trips/<trip_id>/places/
# =========================================================
class TripPlacesListCreateView(generics.ListCreateAPIView):

    serializer_class = TripPlaceSerializer
    permission_classes = [permissions.IsAuthenticated]

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
# PATCH /trips/<trip_id>/reorder-places/
# =========================================================
class ReorderTripPlacesView(APIView):

    permission_classes = [permissions.IsAuthenticated]

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

        serializer = ReorderTripPlacesSerializer(
            data=request.data
        )

        if serializer.is_valid():

            result = serializer.save(trip=trip)

            return Response(
                result,
                status=status.HTTP_200_OK
            )

        return Response(
            serializer.errors,
            status=status.HTTP_400_BAD_REQUEST
        )