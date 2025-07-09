"""
Revision ID: sync_brands_schema
Revises: 4fb1de4c2829
Create Date: 2025-07-07 12:00:00
"""
from alembic import op
import sqlalchemy as sa

revision = 'sync_brands_schema'
down_revision = '4fb1de4c2829'

def upgrade():
    # Đổi tên cột title -> name, logo -> logo_url nếu tồn tại
    with op.batch_alter_table('brands') as batch_op:
        try:
            batch_op.alter_column('title', new_column_name='name')
        except Exception:
            pass
        try:
            batch_op.alter_column('logo', new_column_name='logo_url')
        except Exception:
            pass
        # Thêm cột nếu thiếu
        batch_op.add_column(sa.Column('name', sa.String(255), nullable=True))
        batch_op.add_column(sa.Column('logo_url', sa.String(500), nullable=True))
        # Xóa cột thừa nếu còn
        try:
            batch_op.drop_column('title')
        except Exception:
            pass
        try:
            batch_op.drop_column('logo')
        except Exception:
            pass

def downgrade():
    with op.batch_alter_table('brands') as batch_op:
        batch_op.alter_column('name', new_column_name='title')
        batch_op.alter_column('logo_url', new_column_name='logo')
