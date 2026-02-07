help:
	@echo ""
	@echo "Open the Makefile to see available commands"
	@echo ""

dev:
	uv run fastapi dev app/main.py
	
migrate-auto:
	uv run alembic revision --autogenerate -m "$(m)"

migrate-up:
	uv run alembic upgrade head

migrate-down:
	uv run alembic downgrade -1