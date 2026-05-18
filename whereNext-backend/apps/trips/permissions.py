from rest_framework.permissions import BasePermission
from trips.models import Trip

class IsTripOwner(BasePermission):
    """
    Permite acceso solo si el trip pertenece al usuario autenticado.
    """

    def has_permission(self, request, view):
        trip_id = view.kwargs.get("trip_id")

        try:
            trip = Trip.objects.get(id=trip_id)
        except Trip.DoesNotExist:
            return False  # DRF devolverá 404

        return trip.user == request.user
