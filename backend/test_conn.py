import psycopg2
try:
    conn = psycopg2.connect("postgresql://neondb_owner:npg_eGlQ7XzaACO2@ep-wispy-mountain-a7s9mb0a-pooler.ap-southeast-2.aws.neon.tech/neondb?sslmode=require", connect_timeout=3)
    print("Success")
except Exception as e:
    print("Failed:", e)
