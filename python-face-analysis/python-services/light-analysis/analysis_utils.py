from __future__ import annotations

from dataclasses import dataclass
from typing import Literal

from PIL import Image, ImageOps


BrightnessLabel = Literal["dark", "balanced", "bright"]
ContrastLabel = Literal["low", "medium", "high"]
OrientationLabel = Literal["portrait", "landscape", "square"]
SharpnessLabel = Literal["soft", "normal", "sharp"]
NoiseRiskLabel = Literal["low", "medium", "high"]
BackgroundComplexityLabel = Literal["simple", "moderate", "busy"]
DominantToneLabel = Literal["dark", "neutral", "light"]
WarmthLabel = Literal["cool", "neutral", "warm"]
StyleLabel = Literal[
    "black_white_sketch",
    "classic_caricature",
    "editorial_portrait",
    "avatar",
]
PortraitTypeLabel = Literal["close_up", "half_body", "full_body_or_wide"]
QualityLabel = Literal["poor", "acceptable", "good", "excellent"]


@dataclass(frozen=True)
class ImageStats:
    width: int
    height: int
    orientation: OrientationLabel
    average_luminance: float
    contrast_score: float
    brightness: BrightnessLabel
    contrast: ContrastLabel
    sharpness_score: float
    sharpness: SharpnessLabel
    noise_score: float
    noise_risk: NoiseRiskLabel
    background_score: float
    background_complexity: BackgroundComplexityLabel
    warmth_score: float
    warmth: WarmthLabel
    dominant_tone: DominantToneLabel
    portrait_type: PortraitTypeLabel


def analyze_portrait_image(image: Image.Image) -> dict:
    width, height = image.size
    stats = _build_stats(image)
    estimated_face_area = _estimated_face_area(width, height)
    recommended_crop = _recommended_crop(width, height)
    warnings = _build_warnings(stats)
    recommendations = _build_recommendations(stats)
    quality_score = _quality_score(stats)
    prompt_hints = _build_prompt_hints(stats)

    return {
        "ok": True,
        "method": "portrait_intelligence_pillow",
        "imageSize": {
            "width": width,
            "height": height,
        },
        "orientation": stats.orientation,
        "quality": {
            "score": quality_score,
            "label": _quality_label(quality_score),
            "sharpness": stats.sharpness,
            "brightness": stats.brightness,
            "contrast": stats.contrast,
            "noiseRisk": stats.noise_risk,
            "resolutionWarning": _resolution_warning(width, height),
        },
        "composition": {
            "estimatedPortraitType": stats.portrait_type,
            "estimatedFaceArea": estimated_face_area,
            "recommendedCrop": recommended_crop,
            "backgroundComplexity": stats.background_complexity,
        },
        "visualTone": {
            "dominantTone": stats.dominant_tone,
            "warmth": stats.warmth,
            "suggestedStyle": _suggested_style(stats),
        },
        "portraitAssumptions": {
            "faceDetected": "estimated",
            "estimatedHeadPose": "frontal",
            "expressionHint": "neutral",
            "confidence": _assumption_confidence(stats),
        },
        "promptHints": prompt_hints,
        "generatedPrompts": _build_generated_prompts(stats, prompt_hints, warnings),
        "warnings": warnings,
        "recommendations": recommendations,
    }


def _build_stats(image: Image.Image) -> ImageStats:
    width, height = image.size
    gray = ImageOps.grayscale(image)
    histogram = gray.histogram()
    average_luminance, contrast_score = _histogram_luminance_stats(histogram)
    brightness = _classify_brightness(average_luminance)
    contrast = _classify_contrast(contrast_score)
    sharpness_score = _edge_strength(gray)
    sharpness = _classify_sharpness(sharpness_score)
    noise_score = _noise_score(gray)
    noise_risk = _classify_noise(noise_score)
    background_score = _background_variance(image)
    background_complexity = _classify_background(background_score)
    warmth_score = _warmth_score(image)
    warmth = _classify_warmth(warmth_score)

    return ImageStats(
        width=width,
        height=height,
        orientation=_classify_orientation(width, height),
        average_luminance=average_luminance,
        contrast_score=contrast_score,
        brightness=brightness,
        contrast=contrast,
        sharpness_score=sharpness_score,
        sharpness=sharpness,
        noise_score=noise_score,
        noise_risk=noise_risk,
        background_score=background_score,
        background_complexity=background_complexity,
        warmth_score=warmth_score,
        warmth=warmth,
        dominant_tone=_classify_dominant_tone(average_luminance),
        portrait_type=_estimate_portrait_type(width, height),
    )


def _classify_orientation(width: int, height: int) -> OrientationLabel:
    if width == height:
        return "square"
    if height > width:
        return "portrait"
    return "landscape"


def _histogram_luminance_stats(histogram: list[int]) -> tuple[float, float]:
    total_pixels = sum(histogram)
    if total_pixels <= 0:
        return 0.0, 0.0

    average = sum(level * count for level, count in enumerate(histogram)) / total_pixels
    variance = (
        sum(((level - average) ** 2) * count for level, count in enumerate(histogram))
        / total_pixels
    )

    return average, variance ** 0.5


def _resized_copy(image: Image.Image, max_size: int) -> Image.Image:
    resized = image.copy()
    resized.thumbnail((max_size, max_size))
    return resized


def _edge_strength(gray: Image.Image) -> float:
    small = _resized_copy(gray, 400)
    width, height = small.size
    pixels = small.load()
    total = 0.0
    comparisons = 0

    if width < 2 or height < 2:
        return 0.0

    for y in range(height - 1):
        for x in range(width - 1):
            current = pixels[x, y]
            total += abs(current - pixels[x + 1, y])
            total += abs(current - pixels[x, y + 1])
            comparisons += 2

    return total / comparisons if comparisons else 0.0


def _noise_score(gray: Image.Image) -> float:
    small = _resized_copy(gray, 180)
    width, height = small.size
    pixels = small.load()
    total = 0.0
    samples = 0

    if width < 3 or height < 3:
        return 0.0

    for y in range(1, height - 1):
        for x in range(1, width - 1):
            local_average = (
                pixels[x - 1, y]
                + pixels[x + 1, y]
                + pixels[x, y - 1]
                + pixels[x, y + 1]
            ) / 4
            total += abs(pixels[x, y] - local_average)
            samples += 1

    return total / samples if samples else 0.0


def _background_variance(image: Image.Image) -> float:
    small = _resized_copy(image, 200)
    width, height = small.size
    pixels = small.load()
    border = max(4, int(min(width, height) * 0.08))
    values: list[float] = []

    for y in range(height):
        for x in range(width):
            if x < border or x >= width - border or y < border or y >= height - border:
                red, green, blue = pixels[x, y]
                values.append(_luminance(red, green, blue))

    if not values:
        return 0.0

    average = sum(values) / len(values)
    variance = sum((value - average) ** 2 for value in values) / len(values)
    return variance ** 0.5


def _warmth_score(image: Image.Image) -> float:
    small = _resized_copy(image, 160)
    pixels = list(small.getdata())
    if not pixels:
        return 0.0

    red_average = sum(red for red, _, _ in pixels) / len(pixels)
    blue_average = sum(blue for _, _, blue in pixels) / len(pixels)
    return red_average - blue_average


def _luminance(red: int, green: int, blue: int) -> float:
    return 0.2126 * red + 0.7152 * green + 0.0722 * blue


def _classify_brightness(score: float) -> BrightnessLabel:
    if score < 85:
        return "dark"
    if score > 175:
        return "bright"
    return "balanced"


def _classify_contrast(score: float) -> ContrastLabel:
    if score < 35:
        return "low"
    if score > 70:
        return "high"
    return "medium"


def _classify_sharpness(score: float) -> SharpnessLabel:
    if score < 7:
        return "soft"
    if score > 18:
        return "sharp"
    return "normal"


def _classify_noise(score: float) -> NoiseRiskLabel:
    if score < 4.5:
        return "low"
    if score > 13:
        return "high"
    return "medium"


def _classify_background(score: float) -> BackgroundComplexityLabel:
    if score < 24:
        return "simple"
    if score > 58:
        return "busy"
    return "moderate"


def _classify_dominant_tone(score: float) -> DominantToneLabel:
    if score < 95:
        return "dark"
    if score > 165:
        return "light"
    return "neutral"


def _classify_warmth(score: float) -> WarmthLabel:
    if score > 12:
        return "warm"
    if score < -12:
        return "cool"
    return "neutral"


def _estimate_portrait_type(width: int, height: int) -> PortraitTypeLabel:
    if width > height:
        return "full_body_or_wide"

    aspect = height / max(width, 1)
    if aspect >= 1.45:
        return "close_up"
    return "half_body"


def _estimated_face_area(width: int, height: int) -> dict[str, float]:
    return {
        "x": round(width * 0.22, 2),
        "y": round(height * 0.10, 2),
        "width": round(width * 0.56, 2),
        "height": round(height * 0.62, 2),
    }


def _recommended_crop(width: int, height: int) -> dict[str, float]:
    target_aspect = 4 / 5
    crop_width = width
    crop_height = round(width / target_aspect)

    if crop_height > height:
        crop_height = height
        crop_width = round(height * target_aspect)

    x = max(0, round((width - crop_width) / 2))
    y = max(0, round((height - crop_height) / 2))

    return {
        "x": float(x),
        "y": float(y),
        "width": float(min(crop_width, width)),
        "height": float(min(crop_height, height)),
    }


def _resolution_warning(width: int, height: int) -> str | None:
    if min(width, height) < 640:
        return "Image resolution is low. Results may lose detail."
    return None


def _quality_score(stats: ImageStats) -> int:
    score = 100

    if min(stats.width, stats.height) < 640:
        score -= 24
    elif min(stats.width, stats.height) < 900:
        score -= 10

    if stats.brightness != "balanced":
        score -= 14

    if stats.contrast == "low":
        score -= 12

    if stats.sharpness == "soft":
        score -= 16

    if stats.noise_risk == "high":
        score -= 14
    elif stats.noise_risk == "medium":
        score -= 6

    return max(0, min(100, score))


def _quality_label(score: int) -> QualityLabel:
    if score <= 39:
        return "poor"
    if score <= 64:
        return "acceptable"
    if score <= 84:
        return "good"
    return "excellent"


def _suggested_style(stats: ImageStats) -> StyleLabel:
    if stats.contrast == "high" and stats.brightness != "dark":
        return "black_white_sketch"
    if stats.background_complexity == "simple" and stats.sharpness != "soft":
        return "avatar"
    if stats.brightness == "balanced" and stats.contrast != "low":
        return "classic_caricature"
    return "editorial_portrait"


def _assumption_confidence(stats: ImageStats) -> Literal["low", "medium"]:
    if (
        stats.orientation == "portrait"
        and stats.sharpness != "soft"
        and min(stats.width, stats.height) >= 640
    ):
        return "medium"
    return "low"


def _build_warnings(stats: ImageStats) -> list[str]:
    warnings: list[str] = []

    resolution_warning = _resolution_warning(stats.width, stats.height)
    if resolution_warning:
        warnings.append(resolution_warning)

    if stats.brightness == "dark":
        warnings.append("Image is very dark. AI output may preserve low-light mood.")
    elif stats.brightness == "bright":
        warnings.append("Image is very bright. Some facial details may look flatter.")

    if stats.background_complexity == "busy":
        warnings.append("Background appears busy. Background preservation may be less accurate.")

    if stats.sharpness == "soft":
        warnings.append("Image appears soft. Face details may be less precise.")

    if stats.noise_risk == "high":
        warnings.append("Image may contain visible noise. Fine details may be less clean.")

    return warnings


def _build_recommendations(stats: ImageStats) -> list[str]:
    recommendations = ["Use a front-facing portrait for best caricature results."]

    if stats.brightness == "dark":
        recommendations.append("Use a brighter image for cleaner aging previews.")

    if stats.background_complexity != "simple":
        recommendations.append("Use a simple background for better subject preservation.")

    if min(stats.width, stats.height) < 900:
        recommendations.append("Use a higher resolution image for sharper final results.")

    if stats.sharpness == "soft":
        recommendations.append("Use a sharper photo with clear facial details.")

    return recommendations


def _build_prompt_hints(stats: ImageStats) -> dict[str, list[str]]:
    general = [
        "preserve the same identity",
        "preserve the same head angle",
        "preserve the same expression",
        "preserve clothing and background",
        "preserve the original composition",
        f"preserve the {stats.orientation} composition",
        f"keep the {stats.brightness} lighting mood",
    ]

    if stats.background_complexity == "busy":
        general.append("keep background details close to the original without adding clutter")

    if stats.contrast == "low":
        general.append("preserve soft contrast while keeping facial features readable")

    return {
        "general": general,
        "aging": [
            "create an older version of the same person",
            "add natural forehead lines",
            "add under-eye wrinkles",
            "add natural skin texture",
            "add subtle gray hair",
            "keep identity unchanged",
            "do not change clothes or background",
        ],
        "caricature": [
            "create a tasteful caricature of the same person",
            "preserve identity and recognizable facial structure",
            "exaggerate features moderately",
            "keep the same pose and clothing",
            "keep the background close to the original",
        ],
        "blackWhiteSketch": [
            "convert to black and white sketch style",
            "use graphite pencil and ink linework",
            "no color",
            "preserve identity",
            "add hatching and cross-hatching",
        ],
        "avatar": [
            "create a clean avatar portrait",
            "preserve identity",
            "simplify facial details",
            "keep professional studio look",
            "keep clothing recognizable",
        ],
    }


def _build_generated_prompts(
    stats: ImageStats,
    prompt_hints: dict[str, list[str]],
    warnings: list[str],
) -> dict[str, str]:
    context = [
        f"The source image is {stats.orientation}.",
        f"Lighting is {stats.brightness} with {stats.contrast} contrast.",
        f"The background appears {stats.background_complexity}.",
    ]

    if warnings:
        context.append("Quality notes: " + " ".join(warnings))

    return {
        "agingPrompt": _join_prompt(
            "Create an older version of this person.",
            prompt_hints["general"],
            prompt_hints["aging"],
            context,
        ),
        "caricaturePrompt": _join_prompt(
            "Create a tasteful caricature portrait of this person.",
            prompt_hints["general"],
            prompt_hints["caricature"],
            context,
        ),
        "blackWhiteSketchPrompt": _join_prompt(
            "Create a black and white sketch portrait of this person.",
            prompt_hints["general"],
            prompt_hints["blackWhiteSketch"],
            context,
        ),
        "avatarPrompt": _join_prompt(
            "Create a clean avatar portrait of this person.",
            prompt_hints["general"],
            prompt_hints["avatar"],
            context,
        ),
    }


def _join_prompt(
    lead: str,
    general_hints: list[str],
    tool_hints: list[str],
    context: list[str],
) -> str:
    unique_hints = list(dict.fromkeys([*general_hints, *tool_hints]))
    return " ".join([lead, *unique_hints, *context])
