from django.core.files.storage import default_storage
from django.core.files.base import ContentFile
from django.http import JsonResponse
from django.db.models import Sum
from rest_framework import generics
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView
from rest_framework.response import Response
from .models import Receipt, Item
from django.db.models import Count
from .ocr import extract_text, parse_receipt, categorize_items
from .serializers import ReceiptSerializer, ItemSerializer


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def process_receipt_view(request):
    image_file = request.FILES.get('receipt_image')
    if not image_file:
        return JsonResponse({'error': 'No image provided.'}, status=400)

    # 1. Save and process the image file
    path = default_storage.save('tmp/' + image_file.name, ContentFile(image_file.read()))
    full_path = default_storage.path(path)
    
    # Using the new function names
    raw_text = extract_text(full_path)
    parsed_items = parse_receipt(raw_text)
    
    default_storage.delete(path)

    if not parsed_items:
        return JsonResponse({'error': 'Could not parse items from the receipt.'}, status=400)

    # --- NEW CATEGORIZATION LOGIC ---
    item_names = [item['item'] for item in parsed_items]
    
    categories_list = [
        "Groceries & Household", "Restaurants & Food Services", "Fuel & Transport",
        "Pharmacy & Health", "Retail Shopping", "Bills & Utilities", "Entertainment & Leisure",
        "Travel & Hospitality", "Education & Learning", "Banking & Financial",
        "Services (Personal & Household)", "E-commerce / Online Purchases", "Donations & Memberships"
    ]
    
    # Using the new function name
    categorized_items_dict = categorize_items(item_names, categories_list)
    
    if categorized_items_dict:
        for item in parsed_items:
            item['category'] = categorized_items_dict.get(item['item'], 'Uncategorized')
    else:
        for item in parsed_items:
            item['category'] = 'Uncategorized'

    try:
        receipt = Receipt.objects.create(user=request.user, image=image_file)
        
        items_to_create = [
            Item(receipt=receipt, item_name=item['item'], price=item['price'], category=item['category'])
            for item in parsed_items
        ]
        Item.objects.bulk_create(items_to_create)
        
        return JsonResponse({'message': 'Receipt processed successfully!'}, status=201)
    except Exception as e:
        return JsonResponse({'error': f'Failed to save data: {e}'}, status=500)


class ReceiptListView(generics.ListAPIView):
    serializer_class = ReceiptSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Receipt.objects.filter(user=self.request.user).order_by('-processed_date')


class ReceiptDetailView(generics.RetrieveAPIView):
    serializer_class = ReceiptSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Receipt.objects.filter(user=self.request.user)


class CategorySummaryView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, *args, **kwargs):
        summary = Item.objects.filter(receipt__user=request.user)\
                              .values('category')\
                              .annotate(total_spent=Sum('price'))\
                              .order_by('-total_spent')
        return Response(summary)

class TopItemsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, *args, **kwargs):
        """
        Calculates the top 5 most frequently purchased items for the logged-in user.
        """
        top_items = Item.objects.filter(receipt__user=request.user)\
                                .values('item_name')\
                                .annotate(item_count=Count('item_name'))\
                                .order_by('-item_count')[:5] # Get the top 5
        return Response(top_items)