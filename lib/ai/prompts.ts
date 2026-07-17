import type {
    CaricatureIntensity,
    CaricatureStyle
} from "@/types/caricature";

export type PromptInput = {
    style: CaricatureStyle;
    intensity: CaricatureIntensity;
    variationToken: string;
    isPro: boolean;
};

const variationInstructions = [
    "Use a fresh hand-drawn interpretation with a different line rhythm.",
    "Vary the pencil pressure, outline weight, and shading placement.",
    "Create a new artist-like sketch variation while preserving identity.",
    "Use a slightly different balance of facial exaggeration and paper shading.",
    "Use a different hand-drawn stroke structure, but keep the same person recognizable.",
    "Vary the sketch texture, hatching direction, and caricature emphasis.",
    "Create a new version with different hand-drawn energy and subtle asymmetry."
];

function getIntensityInstruction(intensity: CaricatureIntensity) {
    if (intensity === "low") {
        return `
Caricature intensity:
Subtle and realistic.
Use only light exaggeration.
Keep the face very close to the original photo.
Do not distort the person.
`;
    }

    if (intensity === "medium") {
        return `
Caricature intensity:
Moderate professional caricature.
Slightly exaggerate existing facial features such as eyebrows, nose, jawline, cheeks, and head shape.
Keep the person clearly recognizable.
Do not create extreme cartoon distortion.
`;
    }

    return `
Caricature intensity:
Strong but controlled caricature.
Clearly exaggerate existing facial features, especially the head shape, eyebrows, nose, jawline, cheeks, and expression structure.
Keep identity recognizable.
Do not create grotesque, ugly, or offensive distortion.
`;
}

function getStyleInstruction(style: CaricatureStyle) {
    switch (style) {
        case "black_white_sketch":
            return `
STYLE SELECTED: BLACK AND WHITE SKETCH.

The final image must be black and white only.
Do not use color.
Do not use colored pencil.
Do not use skin tones.
Do not use colored background.

Use:
- graphite pencil
- black ink
- monochrome paper sketch
- black and gray shading
- visible hatching
- cross-hatching
- hand-drawn linework
- white or off-white paper background

Final look:
A realistic black and white hand-drawn caricature sketch.
`;

        case "classic_line_art":
            return `
STYLE SELECTED: CLASSIC LINE ART.

Use clean black ink line art.
Minimal shading.
Simple white or off-white background.
No heavy color.
No digital painting.
The drawing should look like a traditional ink caricature illustration.
`;

        case "street_caricature":
            return `
STYLE SELECTED: STREET CARICATURE.

Use a live street artist caricature style.
Hand-drawn marker and pencil look.
More expressive outlines.
Slightly more playful proportions.
Keep identity recognizable.
Use light natural colors unless black and white is selected.
`;

        case "classic_color":
            return `
STYLE SELECTED: CLASSIC COLOR CARICATURE.

Use traditional colored pencil and ink.
Muted natural colors.
Paper texture.
Soft shading.
Classic hand-drawn caricature portrait.
`;

        case "comic_caricature":
            return `
STYLE SELECTED: COMIC CARICATURE.

Use a clean comic-inspired caricature style.
Bold outlines.
Controlled simplified shapes.
Slightly more stylized expression structure.
Keep the person recognizable.
Avoid extreme cartoon deformation.
`;

        case "realistic_human_drawn":
        default:
            return `
STYLE SELECTED: REALISTIC HUMAN-DRAWN CARICATURE.

Use realistic traditional caricature drawing.
Colored pencil and ink on paper.
Muted natural colors.
Simple hand-drawn outlines.
Light pencil shading.
Low texture.
Visible but clean human strokes.
Off-white paper background.
`;
    }
}

function getQualityInstruction(isPro: boolean) {
    if (isPro) {
        return `
PRO QUALITY INSTRUCTION:
Use higher artistic consistency, cleaner hand-drawn structure, refined pencil and ink control, stronger identity preservation, and premium finished portrait quality.
Do not change the person’s identity, expression, pose, hairstyle, beard, clothes, or gaze direction.
`;
    }

    return `
STANDARD QUALITY INSTRUCTION:
Create a clean standard-quality hand-drawn caricature preview.
Keep the result recognizable, simple, natural, and controlled.
`;
}

export function buildCaricaturePrompt({
                                          style,
                                          intensity,
                                          variationToken,
                                          isPro
                                      }: PromptInput) {
    const randomVariation =
        variationInstructions[
            Math.floor(Math.random() * variationInstructions.length)
            ];

    const randomNumber = Math.floor(Math.random() * 999999999);

    return `
Create a safe, clothed, traditional hand-drawn caricature from the uploaded photo.

SAFETY:
Only create a safe, clothed, non-graphic portrait suitable for general audiences.
If the image cannot be transformed safely, do not add unsafe details.

VERY IMPORTANT:
Do not invent a new expression.
Do not add a smile if the person is not smiling.
Do not add visible teeth unless clearly visible in the original photo.
Do not change the pose.
Do not change the body, clothes, hairstyle, beard, gaze direction, or facial expression.
Do not add props, objects, text, logos, or background details.

Use the uploaded photo as the exact reference for:
- head angle
- gaze direction
- facial expression
- hairstyle
- beard shape
- eyebrows
- nose shape
- jawline
- neck angle
- shoulders and upper body pose
- clothes

${getStyleInstruction(style)}

${getIntensityInstruction(intensity)}

Caricature rules:
Only exaggerate features that already exist in the reference photo.
Preserve the person’s identity.
Preserve the original face direction.
Preserve the original clothing and pose.
Do not beautify the person.
Do not make the skin glossy.
Do not create a digital painting look.
Do not create a plastic AI look.

Variation:
${randomVariation}

This generation must not copy the previous result exactly.
Create a noticeably different hand-drawn interpretation while preserving identity, pose, clothes, and expression.
Vary the linework, shading, pencil texture, and subtle facial exaggeration.

${getQualityInstruction(isPro)}

Uniqueness token:
${variationToken}-${randomNumber}

Final result:
A recognizable traditional hand-drawn caricature based on the uploaded photo, using the selected style exactly.
`;
}