from io import BytesIO

from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi.responses import JSONResponse
from PIL import Image, UnidentifiedImageError

from analysis_utils import analyze_portrait_image


app = FastAPI(title="PortraitLab Studio Portrait Intelligence Engine")


@app.get("/health")
def health() -> dict[str, bool | str]:
    return {"ok": True, "service": "portraitlab-portrait-intelligence"}


@app.post("/analyze-image")
async def analyze_image(image: UploadFile | None = File(default=None)) -> JSONResponse:
    if image is None:
        return JSONResponse(
            status_code=400,
            content={"ok": False, "error": "Upload an image file using the image field."},
        )

    if not image.content_type or not image.content_type.startswith("image/"):
        return JSONResponse(
            status_code=400,
            content={"ok": False, "error": "Invalid file type. Upload an image file."},
        )

    try:
        image_bytes = await image.read()
    except Exception as exc:
        raise HTTPException(status_code=400, detail="Cannot read image upload.") from exc

    if not image_bytes:
        return JSONResponse(
            status_code=400,
            content={"ok": False, "error": "Cannot read image upload."},
        )

    try:
        with Image.open(BytesIO(image_bytes)) as opened_image:
            rgb_image = opened_image.convert("RGB")
            analysis = analyze_portrait_image(rgb_image)

        return JSONResponse(content=analysis)
    except UnidentifiedImageError:
        return JSONResponse(
            status_code=400,
            content={
                "ok": False,
                "error": "Cannot read image. Unsupported or invalid image data.",
            },
        )
    except Exception as exc:
        print("PORTRAIT_INTELLIGENCE_ERROR", repr(exc))
        return JSONResponse(
            status_code=500,
            content={
                "ok": False,
                "error": "Unexpected server error while analyzing image.",
            },
        )
