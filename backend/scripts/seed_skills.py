import sys
import os
import asyncio

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from app.core.database import AsyncSessionLocal
from app.models import Skill
from sqlalchemy import select

skills_data = [
    {"name": "Python", "category": "language"},
    {"name": "R", "category": "language"},
    {"name": "Julia", "category": "language"},
    {"name": "C++", "category": "language"},
    {"name": "Java", "category": "language"},
    {"name": "JavaScript", "category": "language"},
    {"name": "TypeScript", "category": "language"},
    {"name": "SQL", "category": "language"},
    {"name": "Bash", "category": "language"},
    
    {"name": "PyTorch", "category": "framework"},
    {"name": "TensorFlow", "category": "framework"},
    {"name": "Keras", "category": "framework"},
    {"name": "scikit-learn", "category": "framework"},
    {"name": "XGBoost", "category": "framework"},
    {"name": "LightGBM", "category": "framework"},

    {"name": "Transformers", "category": "framework"},
    {"name": "Diffusers", "category": "framework"},
    {"name": "LangChain", "category": "framework"},
    {"name": "LlamaIndex", "category": "framework"},
    {"name": "Hugging Face", "category": "framework"},

    {"name": "pandas", "category": "tool"},
    {"name": "NumPy", "category": "tool"},
    {"name": "Polars", "category": "tool"},
    {"name": "Dask", "category": "tool"},
    {"name": "Spark", "category": "tool"},
    {"name": "Airflow", "category": "tool"},
    {"name": "dbt", "category": "tool"},

    {"name": "OpenCV", "category": "tool"},
    {"name": "YOLO", "category": "framework"},
    {"name": "Detectron2", "category": "framework"},
    {"name": "MMDetection", "category": "framework"},

    {"name": "spaCy", "category": "tool"},
    {"name": "NLTK", "category": "tool"},
    {"name": "Gensim", "category": "tool"},
    {"name": "FastText", "category": "framework"},

    {"name": "AWS", "category": "cloud"},
    {"name": "GCP", "category": "cloud"},
    {"name": "Azure", "category": "cloud"},
    {"name": "SageMaker", "category": "cloud"},
    {"name": "Vertex AI", "category": "cloud"},

    {"name": "MLflow", "category": "tool"},
    {"name": "Kubeflow", "category": "tool"},
    {"name": "Weights & Biases", "category": "tool"},
    {"name": "DVC", "category": "tool"},
    {"name": "BentoML", "category": "tool"},

    {"name": "PostgreSQL", "category": "database"},
    {"name": "MongoDB", "category": "database"},
    {"name": "Redis", "category": "database"},
    {"name": "Pinecone", "category": "database"},
    {"name": "Weaviate", "category": "database"},

    {"name": "Git", "category": "tool"},
    {"name": "Docker", "category": "tool"},
    {"name": "Kubernetes", "category": "tool"},
    {"name": "Linux", "category": "tool"},
]

additional_skills = [
    "C", "C#", "Go", "Rust", "Swift", "Kotlin", "Ruby", "PHP",
    "MATLAB", "Scala", "Perl", "Haskell", "Lua", "Dart", "Objective-C",
    "Assembly", "HTML", "CSS", "React", "Next.js", "Vue.js", "Angular",
    "Svelte", "Tailwind CSS", "Bootstrap", "Node.js", "Express", "FastAPI",
    "Flask", "Django", "Spring Boot", "Ruby on Rails", "Laravel", "ASP.NET",
    "GraphQL", "REST", "gRPC", "WebSockets", "Apache Kafka", "RabbitMQ",
    "Celery", "Memcached", "Elasticsearch", "Solr", "Cassandra",
    "DynamoDB", "Neo4j", "Firebase", "Supabase", "Docker Compose", "Terraform",
    "Ansible", "Puppet", "Chef", "Jenkins", "GitHub Actions", "GitLab CI",
    "CircleCI", "Travis CI", "Prometheus", "Grafana", "Datadog", "New Relic",
    "Splunk", "ELK Stack", "Nginx", "Apache HTTP Server", "HAProxy", "Caddy",
    "Linux Administration", "Windows Server", "macOS", "Bash Scripting",
    "PowerShell", "Vim", "Emacs", "VS Code", "IntelliJ IDEA", "PyCharm",
    "Jupyter", "Colab", "Kaggle", "Tableau", "Power BI", "Looker", "Metabase",
    "Snowflake", "Databricks", "Redshift", "BigQuery", "Athena", "Presto",
    "Trino", "Hadoop", "Hive", "Pig", "Sqoop", "Flume", "Oozie", "Zookeeper",
    "Scrapy", "BeautifulSoup", "Selenium", "Playwright", "Cypress", "Jest",
    "Mocha", "Chai", "Pytest", "Unittest", "JUnit", "TestNG", "Mockito"
]

for skill in additional_skills:
    skills_data.append({"name": skill, "category": "tool"})

async def seed():
    async with AsyncSessionLocal() as db:
        for item in skills_data:
            result = await db.execute(select(Skill).where(Skill.name == item["name"]))
            existing = result.scalar_one_or_none()
            if not existing:
                new_skill = Skill(name=item["name"], category=item["category"], is_verified=True)
                db.add(new_skill)
        await db.commit()
        print(f"Seeded {len(skills_data)} skills.")
    
    from app.core.database import engine
    await engine.dispose()

if __name__ == "__main__":
    asyncio.run(seed())
