import ipaddress
import httpx
from typing import Dict, Any

async def enrich_ip(ip: str) -> Dict[str, Any]:
    """
    Enriches an IP with geolocation, ASN, ISP, and threat flags.
    Safely skips RFC-1918 private / loopback IP spaces.
    """
    try:
        ip_obj = ipaddress.ip_address(ip)
        if ip_obj.is_private or ip_obj.is_loopback or ip_obj.is_reserved:
            return {
                "ip": ip,
                "is_private": True,
                "country": "Internal Network",
                "country_code": "LAN",
                "city": "Internal Subnet",
                "isp": "RFC-1918 Private Address Space",
                "org": "Local Infrastructure",
                "is_threat": False,
                "threat_score": 0,
                "classification": "Private / Non-Routable"
            }
    except ValueError:
        return {"ip": ip, "error": "Invalid IP format"}

    # Query public intelligence feed (ip-api with security/hosting fields)
    url = f"http://ip-api.com/json/{ip}?fields=status,message,country,countryCode,city,isp,org,as,mobile,proxy,hosting,query"
    
    try:
        async with httpx.AsyncClient(timeout=3.0) as client:
            res = await client.get(url)
            if res.status_code == 200:
                data = res.json()
                if data.get("status") == "success":
                    is_proxy = data.get("proxy", False)
                    is_hosting = data.get("hosting", False)
                    
                    # Calculate a pragmatic threat score based on infrastructure type
                    # Hosting/VPN/Proxy nodes are disproportionately used as C2 or relays
                    threat_score = 15
                    if is_hosting:
                        threat_score += 45
                    if is_proxy:
                        threat_score += 35

                    return {
                        "ip": ip,
                        "is_private": False,
                        "country": data.get("country", "Unknown"),
                        "country_code": data.get("countryCode", "??"),
                        "city": data.get("city", "Unknown"),
                        "isp": data.get("isp", "Unknown"),
                        "org": data.get("org", data.get("as", "Unknown")),
                        "is_proxy": is_proxy,
                        "is_hosting": is_hosting,
                        "threat_score": threat_score,
                        "classification": "Suspicious / Data Center" if threat_score >= 50 else "Standard External Route"
                    }
    except Exception as err:
        print(f"Enrichment error for {ip}: {err}")

    # Graceful fallback on API timeout or rate limit
    return {
        "ip": ip,
        "is_private": False,
        "country": "Unknown",
        "country_code": "??",
        "city": "Unknown",
        "isp": "External Host",
        "org": "External Host",
        "threat_score": 20,
        "classification": "Unverified External IP"
    }

async def enrich_all_ips(ips: list[str]) -> list[Dict[str, Any]]:
    results = []
    for ip in ips[:5]:  # Limit to first 5 IPs to maintain rapid response times
        info = await enrich_ip(ip)
        results.append(info)
    return results
