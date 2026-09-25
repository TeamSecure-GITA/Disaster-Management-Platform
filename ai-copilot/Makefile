.PHONY: help install dev test lint format clean run docker-build docker-run

help:
	@echo "Available commands:"
	@echo "  install      Install production dependencies"
	@echo "  dev          Install dev dependencies"
	@echo "  test         Run test suite"
	@echo "  lint         Run linters"
	@echo "  format       Format codebase"
	@echo "  clean        Clean cache artifacts"
	@echo "  run          Start local server"
	@echo "  docker-build Build Docker container"
	@echo "  docker-run   Run containerized service"

install:
	pip install -r requirements.txt

dev:
	pip install -r requirements-dev.txt

test:
	pytest tests/ -v

lint:
	ruff check .

format:
	black .

clean:
	find . -type d -name "__pycache__" -exec rm -rf {} +
	find . -type f -name "*.pyc" -delete
	rm -rf .pytest_cache .coverage htmlcov

run:
	uvicorn api.router:app --host 0.0.0.0 --port 8001 --reload

docker-build:
	docker build -t disaster-ai-copilot .

docker-run:
	docker run -p 8001:8001 --env-file .env disaster-ai-copilot
