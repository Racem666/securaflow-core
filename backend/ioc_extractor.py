import re
from typing import Dict, List

# Regex patterns for standard cyber artifacts
IPV4_REGEX = r"\b(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\b"
URL_REGEX = r"https?://[^\s<>\"')]+"
MD5_REGEX = r"\b[a-fA-F0-9]{32}\b"
SHA256_REGEX = r"\b[a-fA-F0-9]{64}\b"
DOMAIN_REGEX = r"\b(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}\b"

# Exclude common benign domains from being flagged as malicious IOCs
IGNORED_DOMAINS = {"google.com", "microsoft.com", "apple.com", "github.com", "localhost"}

def extract_iocs(text: str) -> Dict[str, List[str]]:
    if not text:
        return {"ips": [], "urls": [], "domains": [], "hashes": [], "firewall_rules": []}

    # 1. Extract raw matches
    ips = list(set(re.findall(IPV4_REGEX, text)))
    urls = list(set(re.findall(URL_REGEX, text)))
    md5s = re.findall(MD5_REGEX, text)
    sha256s = re.findall(SHA256_REGEX, text)
    hashes = list(set(md5s + sha256s))

    # 2. Extract domains and filter out false positives
    raw_domains = re.findall(DOMAIN_REGEX, text)
    domains = list(set([
        d for d in raw_domains 
        if d.lower() not in IGNORED_DOMAINS and not re.match(IPV4_REGEX, d)
    ]))

    # 3. Generate instant, operational defense rules
    firewall_rules = []
    for ip in ips:
        # Generate Linux iptables drop rule
        firewall_rules.append(f"iptables -A INPUT -s {ip} -j DROP")
        # Generate Windows PowerShell firewall rule
        firewall_rules.append(f'New-NetFirewallRule -DisplayName "SecuraFlow-Block-{ip}" -Direction Inbound -Action Block -RemoteAddress {ip}')

    return {
        "ips": ips,
        "urls": urls,
        "domains": domains,
        "hashes": hashes,
        "firewall_rules": firewall_rules
    }
