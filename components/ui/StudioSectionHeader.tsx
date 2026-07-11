type StudioSectionHeaderProps = {
    eyebrow: string;
    title: string;
    description?: string;
    align?: "left" | "center";
};

export function StudioSectionHeader({
                                        eyebrow,
                                        title,
                                        description,
                                        align = "left"
                                    }: StudioSectionHeaderProps) {
    return (
        <div className={align === "center" ? "mx-auto max-w-3xl text-center" : "max-w-3xl"}>
            <p className="text-xs font-black uppercase tracking-[0.28em] text-neutral-500">
                {eyebrow}
            </p>
            <h2 className="mt-3 text-4xl font-black tracking-tight text-neutral-950 md:text-6xl">
                {title}
            </h2>
            {description && (
                <p className="mt-5 text-lg leading-8 text-neutral-600">
                    {description}
                </p>
            )}
        </div>
    );
}
