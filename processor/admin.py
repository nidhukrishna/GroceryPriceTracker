from django.contrib import admin
from .models import Receipt, Item

# This makes the Receipt and Item tables visible in the admin panel
admin.site.register(Receipt)
admin.site.register(Item)