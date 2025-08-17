from django.urls import path
from .views import process_receipt_view
from .views import ReceiptListView, ReceiptDetailView, CategorySummaryView, TopItemsView


urlpatterns = [
    # This maps the URL .../process/ to our view function
    path('process/', process_receipt_view, name='process_receipt'),
    path('', ReceiptListView.as_view(), name='receipt-list'),
    path('<int:pk>/',ReceiptDetailView.as_view(),name='receipt-detail'),
    path('summary/', CategorySummaryView.as_view(), name='category-summary'),
    path('top-items/', TopItemsView.as_view(), name='top-items'),
]