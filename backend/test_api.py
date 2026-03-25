import requests
import json

url = 'http://localhost:8000/api/auth/freelancers/'
# Wait, let me check the base URL from the frontend.
# It seems to be /api/ based on how axios is configured usually.

try:
    response = requests.get(url)
    print(f"Status: {response.status_code}")
    print(f"Response: {json.dumps(response.json(), indent=2)}")
except Exception as e:
    print(f"Error: {e}")
