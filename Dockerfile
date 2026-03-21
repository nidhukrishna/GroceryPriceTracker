FROM python:3.12-slim

ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

RUN apt-get update && apt-get install -y \
    tesseract-ocr \
    libtesseract-dev \
    gcc \
    python3-dev \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

ENV SECRET_KEY=build_dummy_key
ENV DATABASE_URL=sqlite:///db.sqlite3

RUN python manage.py collectstatic --noinput

EXPOSE 10000

CMD ["/bin/sh", "-c", "python manage.py migrate && gunicorn GroceryTracker.wsgi:application --bind 0.0.0.0:10000"]
