import type {
    IntensityOption,
    StyleOption
} from "@/types/caricature";

export const styleOptions: StyleOption[] = [
    {
        value: "realistic_human_drawn",
        label: "Realistic hand-drawn",
        description:
            "A realistic hand-drawn portrait with subtle caricature influence, muted colors, pencil and ink lines."
    },
    {
        value: "classic_line_art",
        label: "Classic line caricature",
        description:
            "A traditional hand-drawn caricature with expressive linework and subtle facial exaggeration."
    },
    {
        value: "black_white_sketch",
        label: "Black & white sketch",
        description:
            "A pencil and ink caricature sketch with a paper-like, editorial drawing feel."
    },
    {
        value: "street_caricature",
        label: "Street caricature",
        description:
            "A lively street-artist caricature with playful proportions and expressive sketch energy.",
        pro: true
    },
    {
        value: "classic_color",
        label: "Classic color caricature",
        description:
            "A hand-drawn caricature with subtle traditional color accents and clean ink outlines.",
        pro: true
    },
    {
        value: "comic_caricature",
        label: "Comic caricature",
        description:
            "A dynamic hand-drawn comic-style caricature with stronger expression and bold linework.",
        pro: true
    }
];

export const intensityOptions: IntensityOption[] = [
    {
        value: "low",
        label: "Low",
        description:
            "Mostly realistic portrait with subtle caricature influence."
    },
    {
        value: "medium",
        label: "Medium",
        description:
            "Visible but controlled exaggeration while keeping the face recognizable."
    },
    {
        value: "high",
        label: "High",
        description:
            "Bolder caricature interpretation with stronger facial emphasis."
    }
];