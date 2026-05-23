"""add reviews table

Revision ID: a7b8c9d0e1f2
Revises: f6a7b8c9d0e1
Create Date: 2026-05-23

"""
from alembic import op
import sqlalchemy as sa

revision = 'a7b8c9d0e1f2'
down_revision = 'f6a7b8c9d0e1'
branch_labels = None
depends_on = None


def upgrade():
    op.create_table(
        'reviews',
        sa.Column('id', sa.Integer(), primary_key=True),
        sa.Column('user_id', sa.Integer(), sa.ForeignKey('users.id', ondelete='CASCADE'), nullable=False),
        sa.Column('tmdb_id', sa.Integer(), nullable=False),
        sa.Column('media_type', sa.String(10), nullable=False, server_default='movie'),
        sa.Column('rating', sa.SmallInteger(), nullable=False),
        sa.Column('body', sa.Text(), nullable=False),
        sa.Column('has_spoiler', sa.Boolean(), nullable=False, server_default='false'),
        sa.Column('is_anonymous', sa.Boolean(), nullable=False, server_default='false'),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.CheckConstraint('rating >= 1 AND rating <= 5', name='chk_reviews_rating'),
        sa.CheckConstraint('char_length(body) >= 10 AND char_length(body) <= 2000', name='chk_reviews_body_length'),
        sa.UniqueConstraint('user_id', 'tmdb_id', 'media_type', name='unique_user_review'),
    )
    op.create_index('idx_reviews_tmdb', 'reviews', ['tmdb_id', 'media_type'])
    op.create_index('idx_reviews_user', 'reviews', ['user_id'])
    op.create_index('idx_reviews_created', 'reviews', [sa.text('created_at DESC')])


def downgrade():
    op.drop_index('idx_reviews_created', 'reviews')
    op.drop_index('idx_reviews_user', 'reviews')
    op.drop_index('idx_reviews_tmdb', 'reviews')
    op.drop_table('reviews')
