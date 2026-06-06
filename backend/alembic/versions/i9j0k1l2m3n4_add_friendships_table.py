"""add friendships table and is_public to watchlist_collections

Revision ID: i9j0k1l2m3n4
Revises: h8i9j0k1l2m3
Create Date: 2026-06-07
"""
from alembic import op
import sqlalchemy as sa

revision = 'i9j0k1l2m3n4'
down_revision = 'h8i9j0k1l2m3'
branch_labels = None
depends_on = None


def upgrade():
    op.create_table(
        'friendships',
        sa.Column('id', sa.Integer(), primary_key=True),
        sa.Column('follower_id', sa.Integer(), sa.ForeignKey('users.id', ondelete='CASCADE'), nullable=False),
        sa.Column('following_id', sa.Integer(), sa.ForeignKey('users.id', ondelete='CASCADE'), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.CheckConstraint('follower_id != following_id', name='no_self_follow'),
        sa.UniqueConstraint('follower_id', 'following_id', name='unique_follow'),
    )
    op.create_index('idx_friendships_follower', 'friendships', ['follower_id'])
    op.create_index('idx_friendships_following', 'friendships', ['following_id'])

    op.add_column('watchlist_collections', sa.Column('is_public', sa.Boolean(), nullable=False, server_default='true'))


def downgrade():
    op.drop_index('idx_friendships_following', table_name='friendships')
    op.drop_index('idx_friendships_follower', table_name='friendships')
    op.drop_table('friendships')
    op.drop_column('watchlist_collections', 'is_public')
