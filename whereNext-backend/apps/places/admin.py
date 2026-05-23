from django.contrib import admin
from .models import Place

if admin.site.is_registered(Place):
    admin.site.unregister(Place)

@admin.register(Place)
class PlaceAdmin(admin.ModelAdmin):
    list_display = (
        'id', 
        'name', 
        'city', 
        'country', 
        'category',
        'is_official', 
        'verified', 
        'created_by'
    )
    
    list_filter = ('category', 'is_official', 'verified')
    
  
    search_fields = ('name', 'country', 'city', 'category')
