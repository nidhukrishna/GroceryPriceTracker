from django.urls import path
from .views import process_receipt_view
from .views import ReceiptListView, ReceiptDetailView

urlpatterns = [
    # This maps the URL .../process/ to our view function
    path('process/', process_receipt_view, name='process_receipt'),
    path('', ReceiptListView.as_view(), name='receipt-list'),
    path('<int:pk>/',ReceiptDetailView.as_view(),name='receipt-detail'),
]