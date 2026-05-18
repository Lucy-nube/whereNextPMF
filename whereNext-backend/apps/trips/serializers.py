from rest_framework import serializers
from django.core.validators import MinValueValidator

from apps.places.models import Place
from apps.trips.models import Trip
from .models import TripPlace


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

        # Validar IDs duplicados
        ids = [item["id"] for item in items]
        if len(ids) != len(set(ids)):
            raise serializers.ValidationError("Hay TripPlaces duplicados en la lista.")

        return data

    def save(self, trip):
        items = self.validated_data["items"]

        # 1. Cargar todos los TripPlaces del trip
        trip_places = TripPlace.objects.filter(trip=trip)

        # 2. Mapear por ID para acceso rápido
        tp_map = {tp.id: tp for tp in trip_places}

        # 3. Aplicar cambios de día enviados por el frontend
        for item in items:
            tp = tp_map[item["id"]]
            tp.day = item["day"]

        # 4. Reagrupar por día
        days = {}
        for tp in trip_places:
            days.setdefault(tp.day, []).append(tp)

        # 5. Ordenar días ascendentemente
        sorted_days = sorted(days.keys())

        # 6. Recalcular order dentro de cada día
        for day in sorted_days:
            tps = days[day]
            tps.sort(key=lambda x: x.id)  # orden estable
            for index, tp in enumerate(tps, start=1):
                tp.order = index
                tp.save()

        # 7. Construir respuesta final
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
# 3) Serializers existentes (TripPlace y Trip)
# ---------------------------------------------------------
class NestedPlaceSerializer(serializers.Serializer):
    id = serializers.IntegerField()


class TripPlaceSerializer(serializers.ModelSerializer):
    place = NestedPlaceSerializer()

    class Meta:
        model = TripPlace
        fields = ["id", "trip", "place", "day", "order", "notes"]
        read_only_fields = ["id"]

    def validate_place(self, value):
        place_id = value.get("id")
        if not Place.objects.filter(id=place_id).exists():
            raise serializers.ValidationError("Place with this ID does not exist.")
        return value

    def create(self, validated_data):
        place_data = validated_data.pop("place")
        place = Place.objects.get(id=place_data["id"])

        trip = validated_data["trip"]

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


class TripSerializer(serializers.ModelSerializer):
    trip_places = TripPlaceSerializer(many=True, read_only=False)

    class Meta:
        model = Trip
        fields = [
            "id",
            "title",
            "description",
            "start_date",
            "end_date",
            "is_public",
            "trip_places",
        ]
        read_only_fields = ["id"]

    def create(self, validated_data):
        trip_places_data = validated_data.pop("trip_places", [])
        trip = Trip.objects.create(**validated_data)

        for tp_data in trip_places_data:
            place_data = tp_data.pop("place")
            place_id = place_data.get("id")

            place = Place.objects.get(id=place_id)

            TripPlace.objects.create(
                trip=trip,
                place=place,
                **tp_data
            )

        return trip

    def update(self, instance, validated_data):
        if "trip_places" in validated_data:
            raise serializers.ValidationError(
                "TripPlaces cannot be updated from Trip. Use the TripPlace endpoint."
            )

        instance.title = validated_data.get("title", instance.title)
        instance.description = validated_data.get("description", instance.description)
        instance.start_date = validated_data.get("start_date", instance.start_date)
        instance.end_date = validated_data.get("end_date", instance.end_date)
        instance.is_public = validated_data.get("is_public", instance.is_public)

        instance.save()
        return instance
