"""add watchlist collections

Revision ID: e5f6a7b8c9d0
Revises: 624cce1fa1af
Create Date: 2026-05-23

"""
from alembic import op
import sqlalchemy as sa

revision = 'e5f6a7b8c9d0'
down_revision = '624cce1fa1af'
branch_labels = None
depends_on = None


def upgrade():
    op.create_table(
        'watchlist_collections',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('name', sa.String(255), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
    )
    op.create_index('ix_watchlist_collections_id', 'watchlist_collections', ['id'], unique=False)
    op.create_index('ix_watchlist_collections_user_id', 'watchlist_collections', ['user_id'], unique=False)

    op.add_column('watchlist', sa.Column('collection_id', sa.Integer(), nullable=True))
    op.create_foreign_key(
        'fk_watchlist_collection_id',
        'watchlist', 'watchlist_collections',
        ['collection_id'], ['id'],
        ondelete='SET NULL',
    )

    # Data migration: create a default collection for each user with watchlist items
    op.execute("""
        INSERT INTO watchlist_collections (user_id, name, created_at)
        SELECT DISTINCT user_id, 'İzleme Listem', NOW()
        FROM watchlist
    """)

    # Assign all existing items to their user's default collection
    op.execute("""
        UPDATE watchlist w
        SET collection_id = wc.id
        FROM watchlist_collections wc
        WHERE wc.user_id = w.user_id
    """)


def downgrade():
    op.drop_constraint('fk_watchlist_collection_id', 'watchlist', type_='foreignkey')
    op.drop_column('watchlist', 'collection_id')
    op.drop_index('ix_watchlist_collections_user_id', table_name='watchlist_collections')
    op.drop_index('ix_watchlist_collections_id', table_name='watchlist_collections')
    op.drop_table('watchlist_collections')
