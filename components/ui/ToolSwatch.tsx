export type ToolSwatchKind =
    | "caricature"
    | "aging"
    | "background"
    | "avatar"
    | "sketch"
    | "batch";

type ToolSwatchProps = {
    kind: ToolSwatchKind;
    className?: string;
};

function CaricatureTexture() {
    return (
        <>
            <path
                d="M3 24C7 14 10 8 14 6"
                stroke="currentColor"
                strokeWidth="2.4"
                strokeLinecap="round"
                fill="none"
            />
            <path
                d="M9 27C13 18 17 10 22 4"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                fill="none"
            />
            <path
                d="M17 28C21 20 24 13 28 7"
                stroke="currentColor"
                strokeWidth="1.4"
                strokeLinecap="round"
                fill="none"
            />
        </>
    );
}

function AgingTexture() {
    return (
        <>
            <circle cx="16" cy="16" r="4" stroke="currentColor" strokeWidth="1.4" fill="none" />
            <circle cx="16" cy="16" r="8.5" stroke="currentColor" strokeWidth="1.2" fill="none" />
            <circle cx="16" cy="16" r="13" stroke="currentColor" strokeWidth="1" fill="none" />
        </>
    );
}

function BackgroundTexture() {
    const cells = [];
    const size = 8;

    for (let row = 0; row < 4; row++) {
        for (let col = 0; col < 4; col++) {
            if ((row + col) % 2 === 0) {
                cells.push(
                    <rect
                        key={`${row}-${col}`}
                        x={col * size}
                        y={row * size}
                        width={size}
                        height={size}
                        fill="currentColor"
                    />
                );
            }
        }
    }

    return <>{cells}</>;
}

function AvatarTexture() {
    const dots = [];
    const rows = 5;
    const cols = 5;

    for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
            const distance = Math.hypot(row - 2, col - 2);
            const radius = Math.max(0.6, 2.6 - distance * 0.7);

            dots.push(
                <circle
                    key={`${row}-${col}`}
                    cx={col * 6.5 + 3}
                    cy={row * 6.5 + 3}
                    r={radius}
                    fill="currentColor"
                />
            );
        }
    }

    return <>{dots}</>;
}

function SketchTexture() {
    const lines = [];

    for (let i = 0; i <= 6; i++) {
        lines.push(
            <line
                key={`d-${i}`}
                x1={i * 5.3}
                y1="0"
                x2={i * 5.3 - 32}
                y2="32"
                stroke="currentColor"
                strokeWidth="1"
            />
        );
        lines.push(
            <line
                key={`u-${i}`}
                x1={i * 5.3}
                y1="0"
                x2={i * 5.3 + 32}
                y2="32"
                stroke="currentColor"
                strokeWidth="1"
            />
        );
    }

    return <g clipPath="url(#sketch-clip)">{lines}</g>;
}

function BatchTexture() {
    const lines = [];

    for (let i = 1; i < 4; i++) {
        lines.push(
            <line key={`v-${i}`} x1={i * 8} y1="0" x2={i * 8} y2="32" stroke="currentColor" strokeWidth="1" />
        );
        lines.push(
            <line key={`h-${i}`} x1="0" y1={i * 8} x2="32" y2={i * 8} stroke="currentColor" strokeWidth="1" />
        );
    }

    return (
        <>
            <rect x="0.5" y="0.5" width="31" height="31" stroke="currentColor" strokeWidth="1" fill="none" />
            {lines}
        </>
    );
}

export function ToolSwatch({ kind, className = "" }: ToolSwatchProps) {
    return (
        <svg
            viewBox="0 0 32 32"
            className={`h-8 w-8 ${className}`}
            aria-hidden="true"
        >
            {kind === "sketch" && (
                <defs>
                    <clipPath id="sketch-clip">
                        <rect x="0" y="0" width="32" height="32" />
                    </clipPath>
                </defs>
            )}
            {kind === "caricature" && <CaricatureTexture />}
            {kind === "aging" && <AgingTexture />}
            {kind === "background" && <BackgroundTexture />}
            {kind === "avatar" && <AvatarTexture />}
            {kind === "sketch" && <SketchTexture />}
            {kind === "batch" && <BatchTexture />}
        </svg>
    );
}
