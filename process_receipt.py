import os
import json
import pytesseract
from PIL import Image
import google.generativeai as genai

GEMINI_API_KEY = "AIzaSyDNEOC8W1eMAiJLQHCCQn1SKz0s7XEzFTI"

# If Tesseract is not in your system's PATH (common on Windows), uncomment and set the path
# pytesseract.pytesseract.tesseract_cmd = r'C:\Program Files\Tesseract-OCR\tesseract.exe'

# --- 2. THE CORE FUNCTIONS ---

def extract_text_from_image(image_path):
    """
    Uses Tesseract to extract raw text from an image file.
    """
    try:
        print(f"Extracting text from '{image_path}' using Tesseract...")
        img = Image.open(image_path)
        raw_text = pytesseract.image_to_string(img)
        print("✅ Text extraction successful.")
        return raw_text
    except FileNotFoundError:
        print(f"❌ ERROR: The file '{image_path}' was not found.")
        return None
    except Exception as e:
        print(f"❌ ERROR: Tesseract failed. Is it installed and in your PATH? Error: {e}")
        return None

def parse_receipt_with_gemini(text):
    """
    Uses the Gemini API to parse raw receipt text into structured JSON.
    """
    if not text:
        return None
        
    try:
        genai.configure(api_key=GEMINI_API_KEY)
        model = genai.GenerativeModel('gemini-1.5-flash')
        generation_config = genai.GenerationConfig(response_mime_type="application/json")
        
        prompt = f"""
        You are an expert receipt data extraction API for Indian receipts.
        Analyze the following text from a grocery receipt and return a JSON object.
        The JSON object must have a single key called "items".
        The value of "items" must be a list of objects.
        Each item object must have exactly two keys: "item" (the string description) and "price" (a floating-point number).
        Do not include totals, taxes, discounts, or any other non-item lines in the list.

        Receipt Text:
        ---
        {text}
        ---
        """
        
        print("Sending extracted text to Gemini for parsing...")
        response = model.generate_content(prompt, generation_config=generation_config)
        result_json = json.loads(response.text)
        print("✅ Gemini parsing successful.")
        return result_json.get("items", [])
    except Exception as e:
        print(f"❌ An error occurred with the Gemini API: {e}")
        return None

# --- 3. MAIN EXECUTION BLOCK ---

if __name__ == '__main__':
    # Replace with the path to a receipt image on your computer
    receipt_image_path = r"C:/Users/Nidhu Krishna/Documents/GroceryTracker/sample/receipt.jpg"

    # Step A: Extract text using local Tesseract
    raw_receipt_text = extract_text_from_image(receipt_image_path)

    # Step B: Parse the raw text using Gemini
    if raw_receipt_text:
        parsed_items = parse_receipt_with_gemini(raw_receipt_text)
        
        if parsed_items:
            print("\n--- 🧾 FINAL PARSED DATA ---")
            for item in parsed_items:
                print(item)
            print("---------------------------\n")
        else:
            print("\nCould not parse items using Gemini.")
    else:
        print("\nCould not proceed to parsing because text extraction failed.")