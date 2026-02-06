help:
	@echo ""
	@echo "Available commands:"
	@echo "  make migrate-auto m=\"msg\"  → autogenerate migration"
	@echo "  make migrate-up               → upgrade head"
	@echo "  make migrate-down          → downgrade -1"
	@echo ""

migrate-auto:
	uv run alembic revision --autogenerate -m "$(m)"

migrate-up:
	uv run alembic upgrade head

migrate-down:
	uv run alembic downgrade -1