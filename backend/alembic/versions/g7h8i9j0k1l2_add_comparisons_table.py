"""add comparisons table

Revision ID: g7h8i9j0k1l2
Revises: f6a7b8c9d0e1
Create Date: 2026-06-06

"""
from alembic import op
import sqlalchemy as sa

revision = 'g7h8i9j0k1l2'
down_revision = 'b8c9d0e1f2a3'
branch_labels = None
depends_on = None


def upgrade():
    op.create_table(
        'comparisons',
        sa.Column('id', sa.Integer(), primary_key=True),
        sa.Column('user_id', sa.Integer(), sa.ForeignKey('users.id', ondelete='CASCADE'), nullable=False),
        sa.Column('tmdb_id_a', sa.Integer(), nullable=False),
        sa.Column('tmdb_id_b', sa.Integer(), nullable=False),
        sa.Column('media_type', sa.String(10), nullable=False, server_default='movie'),
        sa.Column('ai_result', sa.Text(), nullable=False),
        sa.Column('winner_id', sa.Integer(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now()),
    )
    op.create_index('idx_comparisons_user', 'comparisons', ['user_id'])


def downgrade():
    op.drop_index('idx_comparisons_user', table_name='comparisons')
    op.drop_table('comparisons')
