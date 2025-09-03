# Grocery Price Tracker

This full-stack web application allows users to upload pictures of their grocery receipts, automatically extracts the items and prices using Optical Character Recognition (OCR), and provides insights into their spending habits through data visualizations.

## Features

* **User Authentication**: Secure user registration and login.
* <img width="723" height="322" alt="image" src="https://github.com/user-attachments/assets/2ed9991b-489e-4b0a-a2aa-a347218d8ef0" />

* **Receipt Upload**: Users can upload images of their grocery receipts.
* <img width="1174" height="622" alt="image" src="https://github.com/user-attachments/assets/5386cb73-9a52-466e-9551-72951bd89517" />

* **OCR-powered Item Extraction**: Utilizes Tesseract and the Gemini API to extract item names and prices from the receipt images.
* **Expense Categorization**: Automatically categorizes extracted items into predefined spending categories.
* **Spending Visualization**: Displays a pie chart of spending by category for both individual receipts and overall spending.
* <img width="1155" height="683" alt="image" src="https://github.com/user-attachments/assets/b723147e-3156-4b8b-af80-15e33cb1872e" />

* **Top Purchased Items**: Shows a list of the user's most frequently purchased items.

## Tech Stack

### Frontend

* **React**: A JavaScript library for building user interfaces.
* **React Router**: For handling routing within the application.
* **Axios**: For making API requests to the backend.
* **Chart.js**: To create interactive charts for data visualization.

### Backend

* **Django**: A high-level Python web framework.
* **Django REST Framework**: For building robust Web APIs.
* **Simple JWT**: For JSON Web Token authentication.
* **Tesseract**: An OCR engine for extracting text from images.
* **Google Gemini API**: For parsing the raw OCR text into structured JSON data.
* **PostgreSQL**: The production database for storing user and receipt data.
* **SQLite**: The database used for local development.

## Getting Started

To get a local copy up and running, follow these simple steps.

### Prerequisites

* Python 3
* Node.js and npm
* Tesseract

### Installation

1.  **Clone the repo**
    ```sh
    git clone [https://github.com/nidhukrishna/grocerypricetracker.git](https://github.com/nidhukrishna/grocerypricetracker.git)
    ```
2.  **Install backend dependencies**
    ```sh
    cd grocerypricetracker
    pip install -r requirements.txt
    ```
3.  **Install frontend dependencies**
    ```sh
    cd frontend
    npm install
    ```

### Running the Application

1.  **Run the Django backend server**
    ```sh
    python manage.py runserver
    ```
2.  **Run the React frontend**
    ```sh
    cd frontend
    npm start
    ```

## API Endpoints

### Authentication

* `POST /api/auth/register/`: Register a new user.
* `POST /api/auth/login/`: Log in an existing user.
* `GET /api/auth/user/`: Get details for the currently logged-in user.
