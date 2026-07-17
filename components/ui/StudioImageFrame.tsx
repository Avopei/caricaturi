type StudioImageFrameProps = {
    dark?: boolean;
    className?: string;
};

export function StudioImageFrame({ dark = false, className = "" }: StudioImageFrameProps) {
    return (
        <div
            className={`relative h-full w-full overflow-hidden ${
                dark ? "bg-ink text-paper" : "bg-surface text-ink"
            } ${className}`}
        >
            <div
                className={`absolute inset-0 opacity-60 [background-image:linear-gradient(90deg,currentColor_1px,transparent_1px),linear-gradient(currentColor_1px,transparent_1px)] [background-size:26px_26px]`}
                style={{ opacity: dark ? 0.08 : 0.06 }}
            />
            <div
                className={`absolute inset-x-8 top-8 h-40 border ${
                    dark ? "border-line-dark" : "border-line"
                }`}
            />
            <div
                className={`relative mx-auto mt-14 flex aspect-[3/4] w-2/3 max-w-72 flex-col justify-end overflow-hidden border ${
                    dark ? "border-line-dark bg-ink-soft" : "border-line bg-paper"
                }`}
            >
                <div
                    className={`mx-auto mb-14 h-24 w-24 rounded-full border-8 ${
                        dark ? "border-ink bg-line-dark" : "border-paper bg-line"
                    }`}
                />
                <div
                    className={`mx-auto h-32 w-48 rounded-t-full ${
                        dark ? "bg-line-dark" : "bg-ink-soft"
                    }`}
                />
            </div>
        </div>
    );
}
