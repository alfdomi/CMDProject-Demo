import requests
import json

API_BASE_URL = "http://localhost:8000"

print("=== Direct API Test ===\n")

# Test without filter
print("1. All employees (no filter):")
response = requests.get(f"{API_BASE_URL}/labor/employees")
data = response.json()
print(f"   Count: {data['employee_count']}")
print(f"   First 5: {[e['employee_id'] for e in data['employees'][:5]]}\n")

# Test with project_id=1
print("2. Project ID = 1:")
response = requests.get(f"{API_BASE_URL}/labor/employees", params={"project_id": 1})
data = response.json()
print(f"   Count: {data['employee_count']}")
print(f"   Employees: {[e['employee_id'] for e in data['employees']]}\n")

# Test with project_id=2
print("3. Project ID = 2:")
response = requests.get(f"{API_BASE_URL}/labor/employees", params={"project_id": 2})
data = response.json()
print(f"   Count: {data['employee_count']}")
print(f"   Employees: {[e['employee_id'] for e in data['employees']]}\n")

# Test with project_id=3
print("4. Project ID = 3:")
response = requests.get(f"{API_BASE_URL}/labor/employees", params={"project_id": 3})
data = response.json()
print(f"   Count: {data['employee_count']}")
print(f"   Employees: {[e['employee_id'] for e in data['employees']]}\n")
