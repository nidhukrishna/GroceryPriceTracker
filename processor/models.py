from django.db import models
from django.contrib.auth.models import User 

class Receipt(models.Model):
    # Creates a link to a User
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    # An image field to store the uploaded receipt
    image = models.ImageField(upload_to='receipts/')
    # Automatically records the date and time
    processed_date = models.DateTimeField(auto_now_add=True)

class Item(models.Model):
    # Creates a link to a Receipt. Each item must belong to one receipt.
    receipt = models.ForeignKey(Receipt, related_name='items', on_delete=models.CASCADE)
    # A text field to store the item's name.
    item_name = models.CharField(max_length=255)
    # A field for storing money values. It's more accurate than a standard float field.
    price = models.DecimalField(max_digits=10, decimal_places=2)
# Create your models here.
