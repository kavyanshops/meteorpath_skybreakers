import sys
import os
import uvicorn

# Add localized libs to path
libs_path = os.path.join(os.path.dirname(__file__), "libs")
if os.path.exists(libs_path):
    sys.path.insert(0, libs_path)

# Also add the app directory to path
sys.path.insert(0, os.path.dirname(__file__))

if __name__ == "__main__":
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=False)
