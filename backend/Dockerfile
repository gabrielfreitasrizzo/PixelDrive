FROM python:3.12-slim

WORKDIR /app

ENV PYTHONDONTWRITEBYCODE=1
ENV PYTHONUNBUFFERED=1

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 8000

CMD ["sh", "-c", "python manage.py collectstatic --noinput && python manage.py migrate && python manage.py createsuperuser --noinput || true && gunicorn core.wsgi:application --bind 0.0.0.0:8000"]