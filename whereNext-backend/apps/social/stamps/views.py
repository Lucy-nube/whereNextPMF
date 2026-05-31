from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.authentication import JWTAuthentication

from .models import TravelStamp
from .serializers import TravelStampSerializer

class UserTravelStampsView(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request):
        stamps = TravelStamp.objects.filter(user=request.user)
        serializer = TravelStampSerializer(stamps, many=True)
        return Response(serializer.data)
