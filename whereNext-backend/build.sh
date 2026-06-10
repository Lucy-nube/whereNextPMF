#!/usr/bin/env bash
set -o errexit

export DJANGO_SETTINGS_MODULE=config.settings

echo "Installing dependencies..."
pip install -r requirements.txt

echo "Checking Django..."
python manage.py check

echo "Making migrations..."
python manage.py migrate

echo "Collecting static..."
python manage.py collectstatic --noinput || true