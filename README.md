<div align="center">

# 🛡️ SecuraFlow Core
### Autonomous SOC Incident Triage & Threat Intelligence Engine

[![FastAPI](https://img.shields.io/badge/FastAPI-005571?style=for-the-badge&logo=fastapi)](https://fastapi.tiangolo.com)
[![Next.js](https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)](https://nextjs.org/)
[![Python](https://img.shields.io/badge/Python_3.11+-3776AB?style=for-the-badge&logo=python&logoColor=white)](https://www.python.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Groq](https://img.shields.io/badge/AI_Engine-Groq_Llama_3-f55036?style=for-the-badge)](https://groq.com)

<p align="center">
  A production-ready Security Operations Center (SOC) platform designed to eliminate analyst fatigue by unifying real-time event intake, automated AI threat triage (MITRE ATT&CK), regex IOC extraction, and external IP geolocation enrichment into a single command view.
</p>

</div>

---
<img width="929" height="518" alt="face1" src="https://github.com/user-attachments/assets/c91fb3b4-9d35-4429-a866-58749fcf7ae8" />
<img width="927" height="565" alt="dashboard1" src="https://github.com/user-attachments/assets/c7aa6bd8-85eb-402c-8b5e-8dbe64f6f155" />

<img width="944" height="533" alt="dhashboard2" src="https://github.com/user-attachments/assets/4f7b28f9-802a-46fc-bfa1-68e0c4751b19" />

<img width="953" height="521" alt="dhashboard3" src="https://github.com/user-attachments/assets/1abc8e70-a5f0-4e62-b84a-e21b62ae0060" />



## ⚡ Architectural Pipeline

```mermaid
flowchart LR
    A[Threat Report Intake] --> B[FastAPI Gateway]
    B --> C[RegEx IOC Hunter]
    B --> D[Threat Intel Engine]
    B --> E[AI Triage - Groq]
    
    C -->|Extracts IPs, URLs, Hashes| F[(SQLite / SQLAlchemy)]
    D -->|Geo, ISP, ASN, Risk Score| F
    E -->|MITRE ATT&CK, Response Steps| F
    
    F --> G[Next.js Analyst Console]
    G --> H[One-Click Firewall Mitigation]
