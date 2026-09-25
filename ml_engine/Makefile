.PHONY: help install test lint format clean train evaluate calibrate run-experiments

help:
	@echo "Disaster ML Engine Management"
	@echo "  make install         Install dependencies"
	@echo "  make test            Run pytest test suite"
	@echo "  make lint            Run flake8 and mypy checks"
	@echo "  make format          Format code with black and isort"
	@echo "  make clean           Clean cache and build artifacts"
	@echo "  make train           Train all hazard models"
	@echo "  make evaluate        Evaluate models on benchmarks"
	@echo "  make calibrate       Audit model probability calibration"
	@echo "  make run-experiments Execute full automated experiment suite"

install:
	pip install --upgrade pip
	pip install -r requirements.txt
	pip install -r requirements-dev.txt

test:
	pytest tests/ -v

lint:
	flake8 src pipelines scripts tests --max-line-length=120
	mypy src

format:
	black src pipelines scripts tests
	isort src pipelines scripts tests

clean:
	python scripts/cleanup_artifacts.py

train:
	python scripts/train.py --all

evaluate:
	python scripts/evaluate.py --all

calibrate:
	python scripts/calibrate.py --all

run-experiments:
	python pipelines/training/train_all.py
	python pipelines/validation/validate_all.py
