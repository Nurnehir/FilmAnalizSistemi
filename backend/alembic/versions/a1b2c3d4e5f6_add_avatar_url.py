"""add avatar_url to users

Revision ID: a1b2c3d4e5f6
Revises: 8eebf7603a2c
Create Date: 2026-05-18 22:00:00.000000

"""
from alembic import op
import sqlalchemy as sa

revision = 'a1b2c3d4e5f6'
down_revision = '8eebf7603a2c'
branch_labels = None
depends_on = None


def upgrade():
    op.add_column('users', sa.Column('avatar_url', sa.Text(), nullable=True))


def downgrade():
    op.drop_column('users', 'avatar_url')
