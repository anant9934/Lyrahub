from sqlalchemy import create_engine
engine = create_engine('postgresql://neondb_owner:npg_eGlQ7XzaACO2@ep-wispy-mountain-a7s9mb0a-pooler.ap-southeast-2.aws.neon.tech/neondb?sslmode=require')
with engine.connect() as conn:
    conn.execute(engine.dialect.statement_compiler(engine.dialect, None).statement('CREATE EXTENSION IF NOT EXISTS vector'))
    conn.commit()
