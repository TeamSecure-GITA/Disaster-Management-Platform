.PHONY: help install dev build start lint clean test

help:
	@echo "Available commands:"
	@echo "  make install  - Install dependencies"
	@echo "  make dev      - Start Next.js development server"
	@echo "  make build    - Build production Next.js bundle"
	@echo "  make start    - Run production Next.js server"
	@echo "  make lint     - Lint codebase"
	@echo "  make clean    - Remove build artifacts and node_modules"

install:
	npm install

dev:
	npm run dev

build:
	npm run build

start:
	npm run start

lint:
	npm run lint

clean:
	rm -rf .next dist out node_modules
