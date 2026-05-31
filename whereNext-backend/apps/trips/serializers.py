from django.db import transaction
from django.core.validators import MinValueValidator
from rest_framework import serializers
from rest_framework.response import Response
from rest_framework import status


from apps.places.models import Place
from apps.users.serializers import UserSerializer,PublicUserSerializer

from .models import Trip, TripPlace, TripPhoto,TripComment


# ---------------------------------------------------------
# 1) Serializer para cada item del reordenamiento
# ---------------------------------------------------------
class TripPlaceReorderItemSerializer(serializers.Serializer):
    id = serializers.IntegerField()
    day = serializers.IntegerField()
    order = serializers.IntegerField(required=False)

    def validate_id(self, value):
        if not TripPlace.objects.filter(id=value).exists():
            raise serializers.ValidationError(f"TripPlace {value} no existe.")
        return value

    def validate_day(self, value):
        if value < 1:
            raise serializers.ValidationError("El día debe ser >= 1.")
        return value


# ---------------------------------------------------------
# 2) Serializer principal del reordenamiento
# ---------------------------------------------------------
class ReorderTripPlacesSerializer(serializers.Serializer):
    items = TripPlaceReorderItemSerializer(many=True)

    def validate(self, data):
        items = data["items"]

        ids = [item["id"] for item in items]
        if len(ids) != len(set(ids)):
            raise serializers.ValidationError("Hay TripPlaces duplicados en la lista.")

        return data

    def save(self, trip):
        items = self.validated_data["items"]

        # Cargar todos los TripPlaces del trip
        trip_places = TripPlace.objects.filter(trip=trip)

        # Mapa por ID
        tp_map = {tp.id: tp for tp in trip_places}

        # Aplicar cambios de día
        for item in items:
            tp = tp_map[item["id"]]
            tp.day = item["day"]

        # Reagrupar por día
        days = {}
        for tp in trip_places:
            days.setdefault(tp.day, []).append(tp)

        # Ordenar días
        sorted_days = sorted(days.keys())

        # Recalcular order dentro de cada día
        for day in sorted_days:
            tps = days[day]
            tps.sort(key=lambda x: x.id)
            for index, tp in enumerate(tps, start=1):
                tp.order = index
                tp.save()

        # Respuesta final
        response = []
        for day in sorted_days:
            tps = days[day]
            response.append({
                "day": day,
                "places": [
                    {
                        "id": tp.id,
                        "order": tp.order,
                        "place": {
                            "id": tp.place.id,
                            "name": tp.place.name,
                            "description": tp.place.description,
                            "image": tp.place.image.url if tp.place.image else None,
                        }
                    }
                    for tp in tps
                ]
            })

        return {
            "trip_id": trip.id,
            "days": response
        }


# ---------------------------------------------------------
# 3) Serializers existentes (TripPlace, Trip y Photo)
# ---------------------------------------------------------
class NestedPlaceSerializer(serializers.Serializer):
    id = serializers.IntegerField()


class TripPlaceSerializer(serializers.ModelSerializer):
    place = NestedPlaceSerializer()
    likes_count = serializers.IntegerField(source="likes.count", read_only=True)
    liked_by_me = serializers.SerializerMethodField()


    class Meta:
        model = TripPlace
        fields = ["id", "trip", "place", "day", "order", "notes"]
        read_only_fields = ["id"]

    def validate_place(self, value):
        place_id = value.get("id")
        if not Place.objects.filter(id=place_id).exists():
            raise serializers.ValidationError("Place with this ID does not exist.")
        return value
    def get_liked_by_me(self, obj):
     user = self.context["request"].user
     return obj.likes.filter(id=user.id).exists()


    def create(self, validated_data):
        place_data = validated_data.pop("place")
        place = Place.objects.get(id=place_data["id"])

        trip_place = TripPlace.objects.create(
            place=place,
            **validated_data
        )
        return trip_place

    def update(self, instance, validated_data):
        if "place" in validated_data:
            raise serializers.ValidationError("Cannot modify place of an existing TripPlace.")

        instance.day = validated_data.get("day", instance.day)
        instance.order = validated_data.get("order", instance.order)
        instance.notes = validated_data.get("notes", instance.notes)

        instance.save()
        return instance


class TripPhotoSerializer(serializers.ModelSerializer):
    class Meta:
        model = TripPhoto
        fields = ["id", "trip", "image", "caption", "created_at"]
        read_only_fields = ["trip", "created_at"]




class TripSerializer(serializers.ModelSerializer):
    trip_places = TripPlaceSerializer(many=True, required=False)
    photos = serializers.SerializerMethodField()
    companions = PublicUserSerializer(many=True, read_only=True)
    owner = PublicUserSerializer(read_only=True)
    likes_count = serializers.IntegerField(source="likes.count", read_only=True)
    liked_by_me = serializers.SerializerMethodField()
    co_traveler = PublicUserSerializer(read_only=True)


    class Meta:
        model = Trip
        fields = [
            "id",
            "title",
            "description",
            "destination",
            "mood",
            "start_date",
            "end_date",
            "is_public",
            "is_published", 
            "trip_type",
            "co_traveler",
            "owner",
            "companions",
            "trip_places",
            "photos",
            "likes_count",
            "liked_by_me"
        ]
        read_only_fields = ["id"]

    # ⭐ DEVOLVER FOTOS REALES
    def get_photos(self, obj):
        return [
            {
                "id": p.id,
                "image": p.image.url if p.image else None,
                "caption": p.caption,
                "created_at": p.created_at
            }
            for p in obj.photos.all()
        ]

    def get_liked_by_me(self, obj):
        user = self.context["request"].user
        return obj.likes.filter(id=user.id).exists()

    @transaction.atomic
    def create(self, validated_data):
        request = self.context["request"]
        trip_places_data = validated_data.pop("trip_places", [])

        validated_data.pop("owner", None)

        trip = Trip.objects.create(
            owner=request.user,
            **validated_data
        )

        for tp in trip_places_data:
            place_id = tp["place"]["id"]
            place = Place.objects.get(id=place_id)

            TripPlace.objects.create(
                trip=trip,
                place=place,
                day=tp.get("day", 1),
                order=tp.get("order", 1),
                notes=tp.get("notes", ""),
                added_by=request.user
            )

        return trip

    def update(self, instance, validated_data):
        if "trip_places" in validated_data:
            raise serializers.ValidationError(
                "TripPlaces se gestionan por endpoint separado."
            )

        for attr, value in validated_data.items():
            setattr(instance, attr, value)

        instance.save()
        return instance
    
    def destroy(self, request, *args, **kwargs):
     trip = self.get_object()
     trip.delete()
     return Response(status=status.HTTP_204_NO_CONTENT)


class TripCommentSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)

    class Meta:
        model = TripComment
        fields = ["id", "text", "created_at", "user"]
