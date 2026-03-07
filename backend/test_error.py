import sys
from fastapi.testclient import TestClient
from app.main import app

TOKEN = "eyJhbGciOiJkaXIiLCJlbmMiOiJBMjU2R0NNIiwiaXNzIjoiaHR0cHM6Ly9kZXYtY3p3eDcybTZpNTEyMHZ6ai51cy5hdXRoMC5jb20vIn0..gsqwwPSwDOaKfBtV.C6fkVc8sZPjq3iqAFMO7bUR401NTjCpQIXd0AP_aexBeqpsmNjM5qkCo1bNNuPPDpAdBbJ9QXHbUBREt3E8iXK_1c1yHAhwc45MytoCZSNTB3vfhI9F9Ua2lMX369YCdr74D_2jaCz26PjR6p4XVcV154pxUuLKbzWssy8xFVM3QW4QkivJfHMQ5AMtOQNf_sPsw-tSw_tV07aDh_2eqEvkjqNtJ-Mr00AkJVjk3RHxASILkxqjOKaLRKhleAiy4t8Y59owOfmBSYa1glb8LfBsrmZL3MMUBpPigyCbvlmR20mlypyvtQYCjE1wW7_moALhogPffVYYieJYP8q4lwjmm9D0GELpMMoMwgfV6IL3l.8qZ91y02f88GRaoGxH_ZwA"

try:
    with TestClient(app, raise_server_exceptions=True) as client:
        response = client.post(
            "/api/chat/", 
            json={"message": "Hello"}, 
            headers={"Authorization": f"Bearer {TOKEN}"}
        )
        print("STATUS:", response.status_code)
        print("BODY:", response.text)
except Exception as e:
    import traceback
    traceback.print_exc()
