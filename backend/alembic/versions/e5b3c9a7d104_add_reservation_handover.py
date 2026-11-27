"""add handover columns to rezervari

Revision ID: e5b3c9a7d104
Revises: d8a1f4b2e912
"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa

revision: str = "e5b3c9a7d104"
down_revision: Union[str, None] = "d8a1f4b2e912"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column("rezervari", sa.Column("preluat_la", sa.DateTime(timezone=True), nullable=True))
    op.add_column("rezervari", sa.Column("stare_predare", sa.String(length=20), nullable=True))


def downgrade() -> None:
    op.drop_column("rezervari", "stare_predare")
    op.drop_column("rezervari", "preluat_la")
