import requests

response = requests.get("http://localhost:8000/labor/productivity")
data = response.json()

if data:
    first_project = data[0]
    print(f"Has project_id: {'project_id' in first_project}")
    print(f"Keys: {list(first_project.keys())}")
    if 'project_id' in first_project:
        print(f"✅ SUCCESS! project_id = {first_project['project_id']}")
    else:
        print("❌ FAIL! project_id not in response")
