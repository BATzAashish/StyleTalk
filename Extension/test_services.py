import requests

print("Testing Backend: http://localhost:5000/health")
try:
    r = requests.get("http://localhost:5000/health", timeout=2)
    print(" Backend running on port 5000")
except:
    print(" Backend NOT running")

print("\nTesting Frontend: http://localhost:8080")
try:
    r = requests.get("http://localhost:8080/", timeout=2)
    print(" Frontend running on port 8080")
except:
    print(" Frontend NOT running")
