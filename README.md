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
