#!/usr/bin/env bash
set -o errexit

export DJANGO_SETTINGS_MODULE=config.settings

pip install -r requirements.txt

python manage.py collectstatic --noinput
python manage.py migrate