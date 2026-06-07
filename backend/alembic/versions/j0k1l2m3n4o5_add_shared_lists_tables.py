"""add shared lists tables

Revision ID: j0k1l2m3n4o5
Revises: i9j0k1l2m3n4
Create Date: 2026-06-07
"""
from alembic import op
import sqlalchemy as sa

revision = 'j0k1l2m3n4o5'
down_revision = 'i9j0k1l2m3n4'
branch_labels = None
depends_on = None


def upgrade():
    op.create_table(
        'shared_lists',
        sa.Column('id', sa.Integer(), primary_key=True),
        sa.Column('name', sa.String(100), nullable=False, server_default='Birlikte İzleyeceklerimiz'),
        sa.Column('owner_id', sa.Integer(), sa.ForeignKey('users.id', ondelete='CASCADE'), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now()),
    )
    op.create_index('idx_shared_lists_owner', 'shared_lists', ['owner_id'])

    op.create_table(
        'shared_list_members',
        sa.Column('list_id', sa.Integer(), sa.ForeignKey('shared_lists.id', ondelete='CASCADE'), nullable=False),
        sa.Column('user_id', sa.Integer(), sa.ForeignKey('users.id', ondelete='CASCADE'), nullable=False),
        sa.Column('joined_at', sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.PrimaryKeyConstraint('list_id', 'user_id'),
    )
    op.create_index('idx_shared_members_user', 'shared_list_members', ['user_id'])

    op.create_table(
        'shared_list_items',
        sa.Column('id', sa.Integer(), primary_key=True),
        sa.Column('list_id', sa.Integer(), sa.ForeignKey('shared_lists.id', ondelete='CASCADE'), nullable=False),
        sa.Column('tmdb_id', sa.Integer(), nullable=False),
        sa.Column('media_type', sa.String(10), nullable=False, server_default='movie'),
        sa.Column('title', sa.String(255), nullable=False),
        sa.Column('poster_path', sa.String(255), nullable=True),
        sa.Column('added_by', sa.Integer(), sa.ForeignKey('users.id', ondelete='CASCADE'), nullable=False),
        sa.Column('added_at', sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.UniqueConstraint('list_id', 'tmdb_id', 'media_type', name='unique_shared_item'),
    )
    op.create_index('idx_shared_items_list', 'shared_list_items', ['list_id'])


def downgrade():
    op.drop_table('shared_list_items')
    op.drop_table('shared_list_members')
    op.drop_table('shared_lists')
