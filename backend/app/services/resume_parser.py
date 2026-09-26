import os
import re
from abc import ABC, abstractmethod
from sqlalchemy.future import select
from app.core.database import AsyncSessionLocal
from app.models import Skill

class ResumeParser(ABC):
    @abstractmethod
    async def extract(self, text: str) -> dict:
        """Return { 'skills': [], 'projects': [], 'certifications': [] }"""
        pass

class KeywordParser(ResumeParser):
    async def extract(self, text: str) -> dict:
        async with AsyncSessionLocal() as db:
            skills_result = await db.execute(select(Skill.id, Skill.name, Skill.aliases))
            skill_lookup = {}
            for sid, name, aliases in skills_result:
                skill_lookup[name.lower()] = name
                for alias in (aliases or []):
                    skill_lookup[alias.lower()] = name
        
        found = set()
        text_lower = text.lower()
        for keyword, canonical in skill_lookup.items():
            pattern = r'\b' + re.escape(keyword) + r'\b'
            if re.search(pattern, text_lower):
                found.add(canonical)
                
        projects = []
        project_matches = re.finditer(r'(?i)\b(project[s]?[:\-]?)\s*\n?(.{10,200})', text)
        for match in project_matches:
            projects.append({"title": match.group(2).strip()[:50], "description": match.group(2).strip()})

        certs = []
        cert_matches = re.finditer(r'(?i)\b(certifi(?:ed|cate|cation)[s]?[:\-]?)\s*\n?(.{10,100})', text)
        for match in cert_matches:
            certs.append({"title": match.group(2).strip()[:50]})
            
        return {
            "skills": sorted(list(found)),
            "projects": projects,
            "certifications": certs
        }

class OllamaParser(ResumeParser):
    async def extract(self, text: str) -> dict:
        raise NotImplementedError("Ollama parser deferred to Phase 5")

def get_parser() -> ResumeParser:
    provider = os.getenv("PARSER_PROVIDER", "keyword")
    if provider == "keyword":
        return KeywordParser()
    elif provider == "ollama":
        return OllamaParser()
    else:
        raise ValueError(f"Unknown PARSER_PROVIDER: {provider}")
