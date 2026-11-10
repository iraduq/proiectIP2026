from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa


revision: str = 'fb2aefdda6c4'
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        'permisiuni',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('cod', sa.String(length=100), nullable=False),
        sa.Column('descriere', sa.String(length=255), nullable=True),
        sa.PrimaryKeyConstraint('id'),
    )
    op.create_index(op.f('ix_permisiuni_cod'), 'permisiuni', ['cod'], unique=True)
    op.create_table(
        'roluri',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('nume', sa.String(length=50), nullable=False),
        sa.Column('descriere', sa.String(length=255), nullable=True),
        sa.PrimaryKeyConstraint('id'),
    )
    op.create_index(op.f('ix_roluri_nume'), 'roluri', ['nume'], unique=True)
    op.create_table(
        'roluri_permisiuni',
        sa.Column('rol_id', sa.Integer(), nullable=False),
        sa.Column('permisiune_id', sa.Integer(), nullable=False),
        sa.ForeignKeyConstraint(['permisiune_id'], ['permisiuni.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['rol_id'], ['roluri.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('rol_id', 'permisiune_id'),
    )
    op.create_table(
        'utilizatori',
        sa.Column('id_utilizator', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('nume', sa.String(length=255), nullable=False),
        sa.Column('email', sa.String(length=255), nullable=False),
        sa.Column('parola_hash', sa.String(length=255), nullable=False),
        sa.Column('rol_id', sa.Integer(), nullable=False),
        sa.Column('numar_matricol', sa.String(length=100), nullable=True),
        sa.Column('id_angajat', sa.Integer(), nullable=True),
        sa.Column('este_activ', sa.Boolean(), nullable=False),
        sa.Column('creat_la', sa.DateTime(timezone=True), nullable=False),
        sa.Column('actualizat_la', sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(['rol_id'], ['roluri.id']),
        sa.PrimaryKeyConstraint('id_utilizator'),
    )
    op.create_index(op.f('ix_utilizatori_email'), 'utilizatori', ['email'], unique=True)
    op.create_index(op.f('ix_utilizatori_id_utilizator'), 'utilizatori', ['id_utilizator'], unique=False)


def downgrade() -> None:
    op.drop_index(op.f('ix_utilizatori_id_utilizator'), table_name='utilizatori')
    op.drop_index(op.f('ix_utilizatori_email'), table_name='utilizatori')
    op.drop_table('utilizatori')
    op.drop_table('roluri_permisiuni')
    op.drop_index(op.f('ix_roluri_nume'), table_name='roluri')
    op.drop_table('roluri')
    op.drop_index(op.f('ix_permisiuni_cod'), table_name='permisiuni')
    op.drop_table('permisiuni')
