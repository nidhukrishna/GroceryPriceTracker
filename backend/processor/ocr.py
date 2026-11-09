import json
import shutil
import pytesseract
from PIL import Image
import google.generativeai as genai
from django.conf import settings

tesseract_path = shutil.which("tesseract")
if tesseract_path:
    pytesseract.pytesseract.tesseract_cmd = tesseract_path

GEMINI_MODEL = getattr(settings, "GEMINI_MODEL", "gemini-2.5-flash")

CATEGORIES_LIST = [
    "Groceries & Household",
    "Restaurants & Food Services",
    "Fuel & Transport",
    "Pharmacy & Health",
    "Retail Shopping",
    "Bills & Utilities",
    "Entertainment & Leisure",
    "Travel & Hospitality",
    "Education & Learning",
    "Banking & Financial",
    "Services (Personal & Household)",
    "E-commerce / Online Purchases",
    "Donations & Memberships",
]


def _get_gemini_model():
    if not settings.GEMINI_API_KEY:
        raise ValueError("GEMINI_API_KEY is not set in environment variables.")
    genai.configure(api_key=settings.GEMINI_API_KEY)
    return genai.GenerativeModel(GEMINI_MODEL)


def extract_text(image_path_or_file):
    try:
        img = Image.open(image_path_or_file)
        raw_text = pytesseract.image_to_string(img)
        return raw_text
    except Exception as e:
        print(f"Tesseract Error: {e}")
        return None


def extract_and_categorize_from_image(image_file, categories=None):
    """
    Directly passes the receipt image to Gemini (with Tesseract text as helper if available)
    and returns a list of dicts: [{"item": str, "price": float, "category": str}]
    """
    if categories is None:
        categories = CATEGORIES_LIST

    try:
        image_file.seek(0)
        img = Image.open(image_file)
        img.load()
    except Exception as e:
        print(f"Image Open Error: {e}")
        return None

    # Optional: grab Tesseract OCR text to assist Gemini if tesseract is installed
    ocr_text = ""
    try:
        ocr_text = pytesseract.image_to_string(img) or ""
    except Exception:
        pass

    try:
        model = _get_gemini_model()
        generation_config = genai.GenerationConfig(response_mime_type="application/json")
        categories_str = ", ".join(categories)

        prompt = f"""
        You are an expert receipt data extraction API for Indian grocery and retail receipts.
        Analyze the receipt image (and supplementary OCR text if provided) and extract all purchased line items.
        
        Return a valid JSON object with a single key "items", which is a list of objects.
        Each object in "items" MUST have:
        - "item": string (cleaned, readable item name in uppercase, e.g., "AMUL TAAZA MILK 500ML")
        - "price": number (final line price for that item as a float)
        - "category": string (must be one of: [{categories_str}])

        Ignore subtotals, grand totals, CGST/SGST tax lines, discounts, cash tendered, and store headers/footers.

        Supplementary OCR Text (may contain noise):
        ---
        {ocr_text}
        ---
        """
        response = model.generate_content([prompt, img], generation_config=generation_config)
        result_json = json.loads(response.text)
        items = result_json.get("items", [])

        cleaned_items = []
        for item in items:
            name = str(item.get("item", "")).strip()
            price = item.get("price")
            category = item.get("category", "Groceries & Household")
            if name and price is not None:
                try:
                    cleaned_items.append({
                        "item": name,
                        "price": float(price),
                        "category": category if category in categories else "Groceries & Household",
                    })
                except (ValueError, TypeError):
                    continue
        return cleaned_items
    except Exception as e:
        print(f"Gemini Multimodal Error: {e}")
        return None