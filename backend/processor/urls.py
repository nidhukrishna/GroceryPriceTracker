from django.urls import path
from .views import (
    process_receipt_view,
    ReceiptListView,
    ReceiptDetailView,
    CategorySummaryView,
    TopItemsView,
    ItemHistoryView,
)

urlpatterns = [
    path('process/', process_receipt_view, name='process_receipt'),
    path('', ReceiptListView.as_view(), name='receipt-list'),
    path('<int:pk>/', ReceiptDetailView.as_view(), name='receipt-detail'),
    path('summary/', CategorySummaryView.as_view(), name='category-summary'),
    path('top-items/', TopItemsView.as_view(), name='top-items'),
    path('history/<str:item_name>/', ItemHistoryView.as_view(), name='item-history'),
]