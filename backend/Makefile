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

seed:
	uv run python -m app.scripts.seed

test:
	uv run pytest tests/ -v

test-x:
	uv run pytest tests/ -v --tb=short -x

test-watch:
	uv run ptw tests/ -- -v --tb=short