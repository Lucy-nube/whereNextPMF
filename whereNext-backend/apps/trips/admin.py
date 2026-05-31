from django.contrib import admin
from .models import Trip

# 1. define the admin view settings layout first without decorators
class TripAdmin(admin.ModelAdmin):
    list_display = (
        'id', 
        'title', 
        'owner', 
        'destination', 
        'mood', 
        'start_date', 
        'is_public', 
        'created_at'
    )
    list_filter = ('is_public', 'mood', 'created_at')
    search_fields = ('title', 'destination', 'mood', 'owner__username')

# 2. 🛡️ Safe check: if another file registered it, unregister it right now
if admin.site.is_registered(Trip):
    admin.site.unregister(Trip)

# 3. 🚀 Apply my customized layout columns cleanly
admin.site.register(Trip, TripAdmin)
