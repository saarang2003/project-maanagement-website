from fastapi import Request
from fastapi.exceptions import RequestValidationError, HTTPException
from fastapi.responses import JSONResponse


def error_response(detail: str, status_code: int):
    return JSONResponse(status_code=status_code, content={
        "success": False,
        "error": {
            "code": status_code,
            "message": detail
        }
    })


async def general_exception_handler(req: Request, exc: Exception):
    return error_response(detail="Internal server error", status_code=500)


async def request_validation_exception_handler(req: Request, exc: RequestValidationError):
    return error_response(detail=exc.errors(), status_code=400)


async def http_exception_handler(req: Request, exc: HTTPException):
    return error_response(detail=exc.detail, status_code=exc.status_code)