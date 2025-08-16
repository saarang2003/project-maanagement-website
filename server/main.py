from fastapi import FastAPI, HTTPException, Request
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from fastapi.exceptions import RequestValidationError
from starlette.middleware.cors import CORSMiddleware
from .routes import user , auth , task_list , task , plan 
from .core import exception_handlers
import os 

app = FastAPI()

#CORS
app.add_middleware(
    CORSMiddleware, 
    allow_origins=["http://localhost:5173"],  # Frontend url 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Register API routes ---
app.include_router(auth.router)
app.include_router(user.router)
app.include_router(task_list.router)
app.include_router(task.router)
app.include_router(plan.router)


# --- Register exception handlers ---
app.add_exception_handler(
    Exception, exception_handlers.general_exception_handler)
app.add_exception_handler(
    RequestValidationError, exception_handlers.request_validation_exception_handler)
app.add_exception_handler(
    HTTPException, exception_handlers.http_exception_handler)

# # --- Serve static frontend files ---
# app.mount("/assets", StaticFiles(directory="frontend/dist/assets"), name="assets")



# --- Catch-all to serve index.html for frontend routing ---
@app.middleware("http")
async def frontend_catch_all(request: Request, call_next):
    response = await call_next(request)

    # If the request wasn't handled by any route (404) and isn't an API request
    if response.status_code == 404 and not request.url.path.startswith("/api"):
        index_path = os.path.join("frontend", "dist", "index.html")
        if os.path.exists(index_path):
            return FileResponse(index_path)

    return response