from rest_framework import serializers
from .models import Receipt, Item

class ItemSerializer(serializers.ModelSerializer):

    class Meta:
        model = Item
        
        fields = ['item_name', 'price','category']

class ReceiptSerializer(serializers.ModelSerializer):

    # This tells Django to use the ItemSerializer to represent the related items
    items = ItemSerializer(many=True, read_only=True)

    class Meta:
        model = Receipt
        # We include the 'items' field we defined above
        fields = ['id', 'processed_date', 'image', 'items']