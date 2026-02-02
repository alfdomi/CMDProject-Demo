import requests
import json

response = requests.get("http://localhost:8000/labor/productivity")
data = response.json()

print("=== /labor/productivity response ===")
print(json.dumps(data, indent=2))

if len(data) > 0:
    print("\n=== First project keys ===")
    print(f"Keys: {list(data[0].keys())}")
    print(f"Has project_id: {'project_id' in data[0]}")
