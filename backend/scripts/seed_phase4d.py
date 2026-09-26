import asyncio
import os
import re
from uuid import uuid4
from dotenv import load_dotenv
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from sqlalchemy.future import select

import sys
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ROOT_DIR = os.path.dirname(BASE_DIR)
sys.path.insert(0, BASE_DIR)
load_dotenv(os.path.join(ROOT_DIR, ".env"))

DATABASE_URL = os.environ.get("DATABASE_URL")
if not DATABASE_URL:
    raise RuntimeError("DATABASE_URL not set in environment")

# Normalize postgres:// to postgresql+asyncpg:// if needed
if DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql+asyncpg://", 1)
elif DATABASE_URL.startswith("postgresql://") and not DATABASE_URL.startswith("postgresql+asyncpg://"):
    DATABASE_URL = DATABASE_URL.replace("postgresql://", "postgresql+asyncpg://", 1)

from app.models import Program, Course, ProgramCourse, Opportunity, User

engine = create_async_engine(DATABASE_URL, echo=False)
async_session = sessionmaker(engine, expire_on_commit=False, class_=AsyncSession)


def slugify(text: str) -> str:
    text = text.lower().strip()
    text = re.sub(r'[^\w\s-]', '', text)
    text = re.sub(r'[\s_-]+', '-', text)
    text = re.sub(r'^-+|-+$', '', text)
    return text or "item"


PROGRAMS_DATA = [
  {
    "code": "BTCS-AIML",
    "name": "B.Tech Computer Science and Engineering (AI & ML)",
    "short_name": "B.Tech AI&ML",
    "degree": "B.Tech",
    "level": "undergraduate",
    "duration_years": 4.0,
    "total_credits": 160,
    "description": "Comprehensive four-year undergraduate curriculum combining deep mathematical foundations with cutting-edge artificial intelligence, machine learning, and deep neural engineering.",
    "eligibility": "10+2 Higher Secondary Examination with Physics, Chemistry, and Mathematics (minimum 60% aggregate).",
    "admission_process": "Admissions through National/State Engineering Entrance Examinations and Direct Merit Rounds.",
    "career_opportunities": "AI Research Engineer, Deep Learning Specialist, Data Architect, MLOps Engineer, Computer Vision Researcher.",
    "program_outcomes": [
      "PO1: Engineering knowledge in computational systems and mathematics",
      "PO2: Problem analysis and algorithmic modeling",
      "PO3: Design/development of intelligent neural solutions",
      "PO4: Conduct investigations of complex AI phenomena",
      "PO5: Modern tool usage: PyTorch, CUDA, Docker, Kubernetes"
    ],
    "program_specific_outcomes": [
      "PSO1: Formulate and train state-of-the-art neural architectures for vision, language, and reasoning domains.",
      "PSO2: Design enterprise-ready, ethical, and scalable MLOps deployment pipelines."
    ],
    "display_order": 1,
    "is_active": True
  },
  {
    "code": "MTCS-MLAI",
    "name": "M.Tech Computer Science and Engineering (ML & AI)",
    "short_name": "M.Tech ML&AI",
    "degree": "M.Tech",
    "level": "postgraduate",
    "duration_years": 2.0,
    "total_credits": 80,
    "description": "Advanced research-intensive postgraduate program focusing on foundational models, probabilistic reasoning, reinforcement learning, and distributed AI systems.",
    "eligibility": "B.Tech / B.E. in CSE, IT, ECE or equivalent with minimum 6.5 CGPA or 60% aggregate, with valid GATE / Entrance score.",
    "admission_process": "Merit evaluation based on undergraduate GPA and technical interview rounds.",
    "career_opportunities": "Principal AI Scientist, Applied Research Scientist, Lead MLOps Architect, Research Fellow.",
    "program_outcomes": [
      "PO1: Advanced theoretical mastery in machine learning algorithms",
      "PO2: Critical analysis and original research publication",
      "PO3: High performance computing and distributed GPU cluster scaling"
    ],
    "program_specific_outcomes": [
      "PSO1: Develop novel neural architectures and contribute to scientific literature in machine intelligence.",
      "PSO2: Architect fault-tolerant and privacy-preserving distributed intelligence systems."
    ],
    "display_order": 2,
    "is_active": True
  },
  {
    "code": "BTCS-MLMINOR",
    "name": "B.Tech CSE (Machine Learning as Engineering Minor)",
    "short_name": "Minor in AI&ML",
    "degree": "B.Tech",
    "level": "minor",
    "duration_years": 4.0,
    "total_credits": 20,
    "description": "Specialized minor program open to students from Mechanical, Electrical, Civil, and Biomedical disciplines to acquire practical AI engineering capabilities.",
    "eligibility": "Open to all enrolled B.Tech students across non-computing branches from Semester 3 onwards with minimum 7.0 CGPA.",
    "admission_process": "Departmental interdisciplinary minor registration portal.",
    "career_opportunities": "Computational Specialist in primary engineering domains, Applied AI Consultant.",
    "program_outcomes": [
      "PO1: Proficiency in machine learning algorithms and predictive analytics",
      "PO2: Cross-disciplinary application of AI in engineering design"
    ],
    "program_specific_outcomes": [
      "PSO1: Integrate machine learning paradigms into physical engineering systems and sensor telemetry."
    ],
    "display_order": 3,
    "is_active": True
  }
]

COURSES_DATA = [
  {
    "code": "CS101",
    "name": "Introduction to Programming & Problem Solving",
    "short_name": "Intro to Prog",
    "credits": 4.0,
    "semester": 1,
    "year": 1,
    "course_type": "core",
    "category": "theory",
    "description": "Fundamentals of algorithmic problem solving, structured programming in Python and C, data representations, and introductory algorithm complexity.",
    "prerequisites": "None",
    "syllabus": "# Module 1: Algorithms & Flowcharts\n# Module 2: Data Types & Control Structures\n# Module 3: Functions, Recursion, Memory\n# Module 4: File I/O and Modular Programming",
    "learning_outcomes": [
      "CO1: Formulate algorithmic solutions for computational problems",
      "CO2: Implement clean, modular Python and C code",
      "CO3: Analyze time and space complexity of fundamental algorithms"
    ],
    "evaluation_scheme": {"quizzes": 20, "midterm": 30, "endterm": 50},
    "edurev_benefits": ["RPL eligible", "Rev Gen 10%"],
    "is_active": True
  },
  {
    "code": "CS201",
    "name": "Data Structures & Algorithm Design",
    "short_name": "DSA",
    "credits": 4.0,
    "semester": 3,
    "year": 2,
    "course_type": "core",
    "category": "theory",
    "description": "Linear and non-linear data structures: arrays, linked lists, trees, graphs, heaps, hash maps, sorting, and dynamic programming.",
    "prerequisites": "CS101 Introduction to Programming",
    "syllabus": "# Module 1: Stacks, Queues, Linked Lists\n# Module 2: Trees and Balanced BSTs (AVL, Red-Black)\n# Module 3: Graphs, Traversals, Shortest Paths\n# Module 4: Greedy and Dynamic Programming",
    "learning_outcomes": [
      "CO1: Select optimal data structures for memory and throughput efficiency",
      "CO2: Implement advanced tree and graph algorithms",
      "CO3: Solve multi-stage decision problems using dynamic programming"
    ],
    "evaluation_scheme": {"lab_assignments": 25, "midterm": 25, "endterm": 50},
    "edurev_benefits": ["RPL eligible", "Industry Coding Benchmark"],
    "is_active": True
  },
  {
    "code": "CS301",
    "name": "Deep Learning & Neural Architectures",
    "short_name": "Deep Learning",
    "credits": 4.0,
    "semester": 5,
    "year": 3,
    "course_type": "core",
    "category": "theory",
    "description": "Foundations of neural computing: feedforward networks, backpropagation, CNNs, RNNs, LSTMs, Transformers, normalization, and optimization techniques.",
    "prerequisites": "CS201 DSA, Linear Algebra, Multivariable Calculus",
    "syllabus": "# Module 1: Perceptrons & Multi-Layer Feedforward Networks\n# Module 2: Convolutional Neural Networks & Feature Extraction\n# Module 3: Recurrent Networks & Sequence Modeling\n# Module 4: Attention Mechanisms and Transformers",
    "learning_outcomes": [
      "CO1: Mathematically derive backpropagation dynamics across arbitrary computational graphs",
      "CO2: Build and train CNNs and Vision Transformers on modern GPUs",
      "CO3: Diagnose gradient vanishing/exploding and apply regularization techniques"
    ],
    "evaluation_scheme": {"project_lab": 30, "midterm": 20, "endterm": 50},
    "edurev_benefits": ["RPL eligible", "Rev Gen 10%", "GPU Lab Access"],
    "is_active": True
  },
  {
    "code": "CS302",
    "name": "Natural Language Processing & Speech",
    "short_name": "NLP",
    "credits": 4.0,
    "semester": 6,
    "year": 3,
    "course_type": "elective",
    "category": "theory",
    "description": "Computational linguistics, tokenization, word embeddings, sequence-to-sequence translation, syntactic parsing, and acoustic speech modeling.",
    "prerequisites": "CS301 Deep Learning",
    "syllabus": "# Module 1: Tokenization, Word2Vec, GloVe\n# Module 2: Seq2Seq, Encoder-Decoder & Attention\n# Module 3: Pre-trained Language Representations (BERT, RoBERTa)\n# Module 4: Speech Recognition & Synthesis Basics",
    "learning_outcomes": [
      "CO1: Design text processing pipelines for tokenization, tagging, and semantics",
      "CO2: Fine-tune transformer encoders for classification and named-entity recognition",
      "CO3: Implement speech audio spectrogram analysis"
    ],
    "evaluation_scheme": {"assignments": 20, "midterm": 30, "endterm": 50},
    "edurev_benefits": ["RPL eligible", "LLM Specialization Track"],
    "is_active": True
  },
  {
    "code": "CS303",
    "name": "Computer Vision & Visual Computing",
    "short_name": "Computer Vision",
    "credits": 4.0,
    "semester": 6,
    "year": 3,
    "course_type": "elective",
    "category": "theory",
    "description": "Image formation, projective geometry, edge detection, optical flow, object detection (YOLO, Faster-RCNN), semantic segmentation, and generative vision.",
    "prerequisites": "CS301 Deep Learning",
    "syllabus": "# Module 1: Image Processing & Geometric Camera Calibration\n# Module 2: Feature Detectors and Descriptors (SIFT, ORB)\n# Module 3: Two-stage and Single-shot Object Detectors\n# Module 4: Semantic Segmentation and Diffusion Models",
    "learning_outcomes": [
      "CO1: Implement spatial filters, camera calibration, and multi-view stereo",
      "CO2: Train real-time object detection models",
      "CO3: Deploy vision models for autonomous tracking and inspection"
    ],
    "evaluation_scheme": {"mini_project": 30, "midterm": 20, "endterm": 50},
    "edurev_benefits": ["RPL eligible", "Vision Lab Sponsored"],
    "is_active": True
  },
  {
    "code": "CS401",
    "name": "Large Language Models & Generative AI",
    "short_name": "LLMs & GenAI",
    "credits": 4.0,
    "semester": 7,
    "year": 4,
    "course_type": "elective",
    "category": "theory",
    "description": "Autoregressive generation, causal self-attention, instruction fine-tuning, LoRA, QLoRA, RLHF, DPO, Retrieval Augmented Generation (RAG), and agentic workflows.",
    "prerequisites": "CS301 Deep Learning, CS302 NLP",
    "syllabus": "# Module 1: Transformer Decoders & Scaling Laws\n# Module 2: Parameter-Efficient Fine-Tuning (PEFT, LoRA)\n# Module 3: Alignment (RLHF, DPO, Constitutional AI)\n# Module 4: RAG Architectures, Vector DBs & Agent Frameworks",
    "learning_outcomes": [
      "CO1: Analyze scaling laws, compute budgets, and tokenization effects",
      "CO2: Fine-tune quantized open-source LLMs using LoRA and flash attention",
      "CO3: Engineer multi-hop RAG systems and tool-calling agent pipelines"
    ],
    "evaluation_scheme": {"capstone_lab": 40, "midterm": 20, "endterm": 40},
    "edurev_benefits": ["RPL eligible", "Rev Gen 15%", "HuggingFace Certified"],
    "is_active": True
  },
  {
    "code": "CS402",
    "name": "MLOps: Machine Learning Operations & Production",
    "short_name": "MLOps",
    "credits": 4.0,
    "semester": 7,
    "year": 4,
    "course_type": "core",
    "category": "practical",
    "description": "Continuous training, feature stores, model registry, artifact versioning, automated testing, Docker containers, Kubernetes deployment, and drift monitoring.",
    "prerequisites": "CS301 Deep Learning",
    "syllabus": "# Module 1: ML Lifecycle & Experiment Tracking (MLflow, Weights & Biases)\n# Module 2: Data Validation & Pipeline Orchestration (Kubeflow, Airflow)\n# Module 3: Containerization & Cloud Deployment\n# Module 4: Drift Detection, Telemetry & Continuous Training",
    "learning_outcomes": [
      "CO1: Build automated CI/CD pipelines for model training and validation",
      "CO2: Deploy low-latency REST and gRPC model inference servers",
      "CO3: Implement real-time data drift monitoring and automated retraining"
    ],
    "evaluation_scheme": {"live_deployment": 40, "midterm": 20, "endterm": 40},
    "edurev_benefits": ["RPL eligible", "Cloud Credit Sponsored"],
    "is_active": True
  },
  {
    "code": "CS403",
    "name": "Reinforcement Learning & Decision Making",
    "short_name": "Reinforcement Learning",
    "credits": 4.0,
    "semester": 7,
    "year": 4,
    "course_type": "elective",
    "category": "theory",
    "description": "Markov Decision Processes, dynamic programming, temporal-difference learning, Q-learning, deep Q-networks (DQN), policy gradients (REINFORCE, PPO, SAC), and multi-agent systems.",
    "prerequisites": "CS301 Deep Learning, Probability & Statistics",
    "syllabus": "# Module 1: MDPs, Bellman Equations & Value Iteration\n# Module 2: Model-Free Control: SARSA & Q-Learning\n# Module 3: Deep Reinforcement Learning (DQN, Actor-Critic)\n# Module 4: Policy Optimization: TRPO, PPO, Multi-Agent RL",
    "learning_outcomes": [
      "CO1: Formulate decision problems under uncertainty as MDPs",
      "CO2: Implement deep policy gradient algorithms in OpenAI Gym / Gymnasium",
      "CO3: Train agents in simulated physics environments"
    ],
    "evaluation_scheme": {"simulation_project": 30, "midterm": 30, "endterm": 40},
    "edurev_benefits": ["RPL eligible"],
    "is_active": True
  },
  {
    "code": "CS404",
    "name": "AI Ethics, Governance & Algorithmic Safety",
    "short_name": "AI Ethics",
    "credits": 3.0,
    "semester": 8,
    "year": 4,
    "course_type": "core",
    "category": "humanities",
    "description": "Algorithmic bias, fairness metrics, explainability (XAI, SHAP, LIME), adversarial robustness, watermarking, intellectual property in synthetic media, and global regulatory frameworks.",
    "prerequisites": "CS301 Deep Learning",
    "syllabus": "# Module 1: Fairness, Accountability & Transparency (FAT)\n# Module 2: Explainable AI & Interpretability Techniques\n# Module 3: Adversarial Vulnerabilities & Red-Teaming\n# Module 4: EU AI Act, Data Protection & AI Governance",
    "learning_outcomes": [
      "CO1: Measure and mitigate demographic bias in training datasets and models",
      "CO2: Generate explainability attributions using SHAP and integrated gradients",
      "CO3: Audit artificial intelligence systems against national and international safety regulations"
    ],
    "evaluation_scheme": {"audit_case_study": 30, "seminar": 30, "endterm": 40},
    "edurev_benefits": ["RPL eligible"],
    "is_active": True
  },
  {
    "code": "CS405",
    "name": "Major Capstone Project & Thesis",
    "short_name": "Capstone Project",
    "credits": 6.0,
    "semester": 8,
    "year": 4,
    "course_type": "project",
    "category": "practical",
    "description": "Two-semester team-based capstone project involving problem discovery, research literature review, system design, implementation, and thesis publication.",
    "prerequisites": "Completion of Sem 1-7 requirements",
    "syllabus": "# Phase 1: Problem Definition & Literature Survey\n# Phase 2: System Architecture & Proof of Concept\n# Phase 3: Final Implementation, Testing & Benchmark Evaluation\n# Phase 4: Project Defense & Conference Manuscript Submission",
    "learning_outcomes": [
      "CO1: Synthesize state-of-the-art literature to solve an open engineering problem",
      "CO2: Implement and benchmark an end-to-end AI software/hardware system",
      "CO3: Author professional technical reports and deliver academic presentations"
    ],
    "evaluation_scheme": {"midterm_milestone": 30, "defense_presentation": 40, "thesis_manuscript": 30},
    "edurev_benefits": ["RPL eligible", "Startup Incubation Track"],
    "is_active": True
  }
]


async def seed():
    print("🌱 Starting Phase 4D Seeding (Programs + Courses + Mappings)...")
    async with async_session() as session:
        # 1. Seed Programs
        programs_map = {}
        for p_data in PROGRAMS_DATA:
            code = p_data["code"]
            stmt = select(Program).where(Program.code == code)
            res = await session.execute(stmt)
            existing = res.scalar_one_or_none()
            if not existing:
                slug = slugify(p_data["name"])
                prog = Program(
                    id=uuid4(),
                    slug=slug,
                    **p_data
                )
                session.add(prog)
                programs_map[code] = prog
                print(f"  + Program created: {code} ({p_data['name']})")
            else:
                programs_map[code] = existing
                print(f"  * Program already exists: {code}")

        await session.flush()

        # 2. Seed Courses
        courses_map = {}
        for c_data in COURSES_DATA:
            code = c_data["code"]
            stmt = select(Course).where(Course.code == code)
            res = await session.execute(stmt)
            existing = res.scalar_one_or_none()
            if not existing:
                slug = slugify(f"{code}-{c_data['name']}")
                course = Course(
                    id=uuid4(),
                    slug=slug,
                    **c_data
                )
                session.add(course)
                courses_map[code] = course
                print(f"  + Course created: {code} ({c_data['name']})")
            else:
                courses_map[code] = existing
                print(f"  * Course already exists: {code}")

        await session.flush()

        # 3. Seed Program Courses Mapping (Curriculum for B.Tech AIML)
        btech_prog = programs_map.get("BTCS-AIML")
        if btech_prog:
            for code, course in courses_map.items():
                stmt = select(ProgramCourse).where(
                    ProgramCourse.program_id == btech_prog.id,
                    ProgramCourse.course_id == course.id
                )
                res = await session.execute(stmt)
                if not res.scalar_one_or_none():
                    mapping = ProgramCourse(
                        id=uuid4(),
                        program_id=btech_prog.id,
                        course_id=course.id,
                        semester=course.semester or 1,
                        is_mandatory=True
                    )
                    session.add(mapping)
                    print(f"  + Mapped {code} to {btech_prog.code} (Sem {course.semester})")

        # 4. Also map to Minor
        minor_prog = programs_map.get("BTCS-MLMINOR")
        if minor_prog:
            for code in ["CS101", "CS201", "CS301", "CS302", "CS404"]:
                course = courses_map.get(code)
                if course:
                    stmt = select(ProgramCourse).where(
                        ProgramCourse.program_id == minor_prog.id,
                        ProgramCourse.course_id == course.id
                    )
                    res = await session.execute(stmt)
                    if not res.scalar_one_or_none():
                        session.add(ProgramCourse(
                            id=uuid4(),
                            program_id=minor_prog.id,
                            course_id=course.id,
                            semester=course.semester or 1,
                            is_mandatory=True
                        ))
                        print(f"  + Mapped {code} to {minor_prog.code}")

        await session.commit()
        print("✅ Phase 4D Seeding Complete!")


if __name__ == "__main__":
    asyncio.run(seed())
