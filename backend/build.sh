#!/bin/bash
pip install -r requirements.txt
cd /opt/render/project/src/backend/ || exit 1
alembic upgrade head