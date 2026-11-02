import json
from groq import Groq

# Initialize Groq client directly
client = Groq(
    api_key=" Your gsk_... key"  # Your gsk_... key
)

def analyze_threat(title: str, description: str, category: str) -> dict:
    prompt = f"""
    You are an enterprise SOC Security Intelligence Engine. Analyze the following incident report:
    - Title: {title}
    - Category: {category}
    - Description: {description}

    Provide your assessment strictly as a JSON object with the following keys:
    {{
      "ai_severity": "Critical" | "High" | "Medium" | "Low",
      "attack_vector": "Short description of the vector",
      "mitre_technique": "e.g., T1566.001 (Spearphishing Attachment)",
      "confidence_score": 85,
      "recommended_actions": ["Step 1", "Step 2", "Step 3"]
    }}
    Do not wrap with markdown blocks or backticks. Return valid raw JSON only.
    """

    try:
        response = client.chat.completions.create(
            model="openai/gpt-oss-120b",
            messages=[
                {"role": "system", "content": "You are a specialized cybersecurity triage engine. Output pure JSON."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.2,
        )
        content = response.choices[0].message.content.strip()
        # Clean any accidental markdown code fence output
        if content.startswith("```"):
            content = content.strip("`").replace("json\n", "", 1)
        return json.loads(content)
    except Exception as e:
        print(f"AI Engine Error: {e}")
        return {
            "ai_severity": "High" if category.lower() in ["phishing", "malware"] else "Medium",
            "attack_vector": "Automated Rule Fallback",
            "mitre_technique": "T1000",
            "confidence_score": 60,
            "recommended_actions": ["Review network logs", "Isolate affected host"]
        }




