"""drop unique_user_review constraint

Revision ID: b8c9d0e1f2a3
Revises: a7b8c9d0e1f2
Create Date: 2026-05-23

"""
from alembic import op
import sqlalchemy as sa

revision = 'b8c9d0e1f2a3'
down_revision = 'a7b8c9d0e1f2'
branch_labels = None
depends_on = None


def upgrade():
    op.drop_constraint('unique_user_review', 'reviews', type_='unique')


def downgrade():
    op.create_unique_constraint(
        'unique_user_review', 'reviews', ['user_id', 'tmdb_id', 'media_type']
    )
