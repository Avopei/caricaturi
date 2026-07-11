# PortraitLab Studio Portrait Intelligence Engine

This local FastAPI service analyzes uploaded portrait images for PortraitLab Studio and returns a richer portrait intelligence object for future Aging, Caricature, black and white sketch, Avatar, and batch portrait workflows.

It uses Pillow only. It does not use NumPy, OpenCV, MediaPipe, OpenAI, or external APIs. Uploaded images are read in memory for analysis and are not stored.

The service is designed for restrictive Windows setups where native-heavy Python dependencies may be blocked by Windows Application Control. It provides approximate image quality, composition, tone, and prompt guidance using lightweight Pillow operations and plain Python loops.

This version does not perform true face detection, face landmarks, segmentation, gaze estimation, or expression recognition. Face area, head pose, and expression values are conservative estimates. A future version can add OpenCV or MediaPipe when those dependencies are available on the target machine.

## Setup on Windows PowerShell

```powershell
py -m venv .venv
.\.venv\Scripts\Activate.ps1
py -m pip install -r requirements.txt
py -m uvicorn main:app --reload --port 8001
```

## Health Check

Open:

```text
http://localhost:8001/health
```

Or use PowerShell:

```powershell
Invoke-RestMethod -Uri http://localhost:8001/health
```

## Analyze Image

Send a multipart image upload to:

```text
POST http://localhost:8001/analyze-image
```

The file field name must be:

```text
image
```

PowerShell example:

```powershell
curl.exe -X POST http://localhost:8001/analyze-image -F "image=@C:\path\to\portrait.jpg"
```

The endpoint returns:

- image size and orientation
- quality score, label, brightness, contrast, sharpness, noise risk, and resolution warning
- estimated portrait composition, face area, recommended crop, and background complexity
- visual tone, warmth, and suggested style
- conservative portrait assumptions
- prompt hints for general use, aging, caricature, black and white sketch, and avatar tools
- generated prompt strings for future AI workflows
- warnings and recommendations

Next.js can call this service from an API route. Existing generation logic does not need to be changed until the frontend is ready to consume the richer analysis result.
