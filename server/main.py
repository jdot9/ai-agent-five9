from fastapi import FastAPI
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
import os

app = FastAPI()

# Mount the ui directory at /static
app.mount("/static", StaticFiles(directory="ui"), name="static")  # adjust path if needed

# Serve your HTML page at root
@app.get("/")
def read_index():
    return FileResponse(os.path.join("ui", "chat.html"))
