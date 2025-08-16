from django.core.files.storage import default_storage
from django.core.files.base import ContentFile
from django.http import JsonResponse
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from .models import Receipt, Item
from .ocr import extract_text, parse_receipt
from rest_framework import generics
from .serializers import ReceiptSerializer

# This decorator ensures the view only accepts POST requests.
@api_view(['POST'])
# This decorator ensures only logged-in users can access this endpoint.
@permission_classes([IsAuthenticated])

def process_receipt_view(request):
    # Get the uploaded image file from the request.
    print("Request received. Here are the files:", request.FILES)
    image_file = request.FILES.get('receipt_image')
    if not image_file:
        return JsonResponse({'error': 'No image provided.'}, status=400)

    # 1. Save the file to a temporary location so we have a path for Tesseract.
    path = default_storage.save('tmp/' + image_file.name, ContentFile(image_file.read()))
    full_path = default_storage.path(path)

    # 2. Call our OCR and Parsing functions.
    raw_text = extract_text(full_path)
    parsed_items = parse_receipt(raw_text)

    # 3. Delete the temporary file
    default_storage.delete(path)

    if not parsed_items:
        return JsonResponse({'error': 'Could not parse items from the receipt.'}, status=400)

    # 4. Save the results to our database.
    try:
        # Create the main Receipt record, linking it to the logged-in user.
        receipt = Receipt.objects.create(user=request.user, image=image_file)

        # Create a list of Item objects to be saved.
        items_to_create = [
            Item(receipt=receipt, item_name=item['item'], price=item['price'])
            for item in parsed_items
        ]
        # Save all items to the database in one efficient query.
        Item.objects.bulk_create(items_to_create)

        # Return a success message.
        return JsonResponse({'message': 'Receipt processed successfully!'}, status=201)
    except Exception as e:
        # If anything goes wrong during the database save, return an error.
        return JsonResponse({'error': f'Failed to save data: {e}'}, status=500)


# Display Receipts
class ReceiptListView(generics.ListAPIView):
    
    # list of all receipts for the currently logged-in user.
    
    serializer_class = ReceiptSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        # filter receipts to show receipts belonging to user
        return Receipt.objects.filter(user=self.request.user)
    

#Display Details of a receipt
class ReceiptDetailView(generics.RetrieveAPIView):
    
    # Provides the details of a single receipt
    
    serializer_class = ReceiptSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):

        return Receipt.objects.filter(user=self.request.user)

