import urllib.request
import urllib.error

try:
    res = urllib.request.urlopen('http://127.0.0.1:8000/api/jobs')
    print("Success:")
    print(res.read().decode())
except urllib.error.HTTPError as e:
    print(f"Error status code: {e.code}")
    try:
        print(e.read().decode())
    except Exception as re:
        print(f"Failed to read error body: {re}")
except Exception as e:
    print(f"Other error: {e}")
