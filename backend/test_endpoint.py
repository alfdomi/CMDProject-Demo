import requests

API_BASE_URL = "http://localhost:8000"

print("=== Testing /labor/employees endpoint ===\n")

# Test 1: All employees
print("1. GET /labor/employees (all projects)")
response = requests.get(f"{API_BASE_URL}/labor/employees")
data = response.json()
print(f"   Employee count: {data['employee_count']}")
print(f"   Employees: {[e['employee_id'] for e in data['employees']]}\n")

# Test 2: Project 1
print("2. GET /labor/employees?project_id=1 (Riverside Plaza)")
response = requests.get(f"{API_BASE_URL}/labor/employees?project_id=1")
data = response.json()
print(f"   Employee count: {data['employee_count']}")
print(f"   Employees: {[e['employee_id'] for e in data['employees']]}\n")

# Test 3: Project 2
print("3. GET /labor/employees?project_id=2 (Downtown Transit Hub)")
response = requests.get(f"{API_BASE_URL}/labor/employees?project_id=2")
data = response.json()
print(f"   Employee count: {data['employee_count']}")
print(f"   Employees: {[e['employee_id'] for e in data['employees']]}\n")

# Test 4: Project 3
print("4. GET /labor/employees?project_id=3 (Skyline Apartments)")
response = requests.get(f"{API_BASE_URL}/labor/employees?project_id=3")
data = response.json()
print(f"   Employee count: {data['employee_count']}")
print(f"   Employees: {[e['employee_id'] for e in data['employees']]}\n")
