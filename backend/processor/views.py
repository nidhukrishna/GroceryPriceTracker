from django.db.models import Sum, Count, Avg, Min, Max
from rest_framework import generics, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView
from rest_framework.response import Response
from .models import Receipt, Item
from .ocr import extract_and_categorize_from_image
from .serializers import ReceiptSerializer


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def process_receipt_view(request):
    image_file = request.FILES.get('receipt_image')
    if not image_file:
        return Response({'error': 'No image provided.'}, status=status.HTTP_400_BAD_REQUEST)

    parsed_items = extract_and_categorize_from_image(image_file)

    if not parsed_items:
        return Response(
            {'error': 'Could not extract items from this receipt. Please try a clearer photo.'},
            status=status.HTTP_400_BAD_REQUEST
        )

    try:
        # Reset file pointer before Django saves the image to Receipt model
        image_file.seek(0)
        receipt = Receipt.objects.create(user=request.user, image=image_file)

        items_to_create = [
            Item(
                receipt=receipt,
                item_name=item['item'],
                price=item['price'],
                category=item.get('category', 'Uncategorized')
            )
            for item in parsed_items
        ]
        Item.objects.bulk_create(items_to_create)

        serializer = ReceiptSerializer(receipt)
        return Response(
            {'message': 'Receipt processed successfully!', 'receipt': serializer.data},
            status=status.HTTP_201_CREATED
        )
    except Exception as e:
        return Response(
            {'error': f'Failed to save receipt data: {str(e)}'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


class ReceiptListView(generics.ListAPIView):
    serializer_class = ReceiptSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Receipt.objects.filter(user=self.request.user).prefetch_related('items').order_by('-processed_date')


class ReceiptDetailView(generics.RetrieveDestroyAPIView):
    serializer_class = ReceiptSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Receipt.objects.filter(user=self.request.user).prefetch_related('items')


class CategorySummaryView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, *args, **kwargs):
        summary = (
            Item.objects.filter(receipt__user=request.user)
            .values('category')
            .annotate(total_spent=Sum('price'))
            .order_by('-total_spent')
        )
        return Response(summary)


class TopItemsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, *args, **kwargs):
        top_items = (
            Item.objects.filter(receipt__user=request.user)
            .values('item_name')
            .annotate(item_count=Count('id'), total_spent=Sum('price'))
            .order_by('-item_count', '-total_spent')[:5]
        )
        return Response(top_items)


class ItemHistoryView(APIView):
    """Returns price history for a specific item across all receipts of the logged-in user."""
    permission_classes = [IsAuthenticated]

    def get(self, request, item_name, *args, **kwargs):
        items = (
            Item.objects.filter(receipt__user=request.user, item_name__iexact=item_name)
            .select_related('receipt')
            .order_by('receipt__processed_date')
        )

        history = [
            {
                'id': item.id,
                'receipt_id': item.receipt.id,
                'item_name': item.item_name,
                'price': float(item.price),
                'category': item.category,
                'date': item.receipt.processed_date,
            }
            for item in items
        ]

        stats = items.aggregate(
            avg_price=Avg('price'),
            min_price=Min('price'),
            max_price=Max('price'),
            times_bought=Count('id'),
        )

        return Response({
            'item_name': item_name,
            'stats': stats,
            'history': history,
        })