"""add genre_ids to watchlist

Revision ID: f6a7b8c9d0e1
Revises: e5f6a7b8c9d0
Create Date: 2026-05-23

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision = 'f6a7b8c9d0e1'
down_revision = 'e5f6a7b8c9d0'
branch_labels = None
depends_on = None


def upgrade():
    op.add_column(
        'watchlist',
        sa.Column(
            'genre_ids',
            postgresql.ARRAY(sa.Integer()),
            server_default='{}',
            nullable=True,
        ),
    )


def downgrade():
    op.drop_column('watchlist', 'genre_ids')
