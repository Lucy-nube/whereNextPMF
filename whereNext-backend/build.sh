#!/usr/bin/env bash
set -o errexit

echo "📦 Moving into backend..."


echo "📦 Installing dependencies..."
pip install -r requirements.txt

echo "🗄 Running migrations..."
python manage.py migrate --noinput

echo "📁 Creating static directory..."
mkdir -p staticfiles

echo "🎨 Collecting static..."
python manage.py collectstatic --noinput

echo "👤 Creating superuser (safe)..."
python manage.py shell < config/create_superuser.py
