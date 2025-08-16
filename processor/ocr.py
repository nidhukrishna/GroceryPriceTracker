import json
import pytesseract
from PIL import Image
import google.generativeai as genai

#Add your Gemini API Key here
# For a real project, use environment variables for this.
GEMINI_API_KEY = "AIzaSyDNEOC8W1eMAiJLQHCCQn1SKz0s7XEzFTI"
genai.configure(api_key=GEMINI_API_KEY)

def extract_text(image_path):
    """Uses Tesseract to extract raw text from an image file."""
    try:
        img = Image.open(image_path)
        raw_text = pytesseract.image_to_string(img)
        return raw_text
    except Exception as e:
        print(f"Tesseract Error: {e}")
        return None

def parse_receipt(text):
    """Uses the Gemini API to parse raw receipt text into structured JSON."""
    if not text:
        return None
    try:
        model = genai.GenerativeModel('gemini-1.5-flash')
        generation_config = genai.GenerationConfig(response_mime_type="application/json")
        prompt = f"""
        You are an expert receipt data extraction API for Indian receipts.
        Analyze the text from a grocery receipt and return a JSON object.
        The object must have a key "items" which is a list. Each object in the list
        must have "item" (string) and "price" (float) keys.
        Ignore totals, taxes, and non-item lines.

        Receipt Text:
        ---
        {text}
        ---
        """
        response = model.generate_content(prompt, generation_config=generation_config)
        result_json = json.loads(response.text)
        
        return result_json.get("items", [])
    except Exception as e:
        print(f"Gemini Error: {e}")
        return None