export type CaricatureStyle =
    | "realistic_human_drawn"
    | "classic_line_art"
    | "black_white_sketch"
    | "street_caricature"
    | "classic_color"
    | "comic_caricature";

export type CaricatureIntensity = "low" | "medium" | "high";

export type StyleOption = {
    value: CaricatureStyle;
    label: string;
    description: string;
    pro?: boolean;
};

export type IntensityOption = {
    value: CaricatureIntensity;
    label: string;
    description: string;
};

export type GenerationPaymentStatus = "unpaid" | "paid";

export type FeedbackRating = "good" | "needs_improvement";

export type UserPlan = "free" | "pro" | "studio";

export type UserRole = "user" | "admin";

export type GenerationQuality = "standard" | "pro" | "hd";

export type WatermarkType = "standard" | "pro" | "none" | "small";

export type GenerationTool = "caricature" | "aging" | "background";

export type GenerationMode = "demo" | "standard" | "pro_lora";

export type ModelProvider = "openai" | "custom_lora_ready";

export type FaceControls = {
    eyes: "normal" | "slightly_larger" | "more_expressive";
    nose: "normal" | "slightly_emphasized" | "more_emphasized";
    jawline: "normal" | "slightly_sharper" | "more_defined";
    expression: "preserve" | "slightly_more_confident";
    headSize: "normal" | "slightly_larger";
};

export type GenerateResponse = {
    generationId?: string;
    originalImage?: string | null;
    previewImage?: string;
    error?: string;
    demo?: boolean;
    paymentStatus?: GenerationPaymentStatus;
    remainingFreeGenerations?: number;
};

export type GenerationsResponse = {
    generations?: LocalGeneration[];
    error?: string;
};

export type LocalGeneration = {
    id: string;
    originalImage?: string | null;
    previewImage: string;
    style: CaricatureStyle;
    intensity: CaricatureIntensity;
    paymentStatus: GenerationPaymentStatus;
    demo: boolean;
    createdAt: string;
    feedbackRating?: FeedbackRating | null;

    quality?: GenerationQuality;
    watermarkType?: WatermarkType;
    isPro?: boolean;
    generationMode?: GenerationMode;
    modelProvider?: ModelProvider;
    modelName?: string | null;

    downloadCount?: number;
    lastDownloadedAt?: string | null;
    selectedForTraining?: boolean;
    adminQualityRating?: number | null;
    adminNotes?: string | null;
};

export type ProfilePlanInfo = {
    plan: UserPlan;
    freeGenerationsUsed: number;
    freeGenerationLimit: number;
    remainingFreeGenerations: number;
};

export type ToolStatus = "active" | "soon" | "available" | "coming_soon" | "pro";

export type StudioTool = {
    title: string;
    description: string;
    href: string;
    status: ToolStatus;
};
