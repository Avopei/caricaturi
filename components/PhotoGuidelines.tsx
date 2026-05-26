export function PhotoGuidelines() {
    const guidelines = [
        "Use a clear portrait photo",
        "Make sure the face is visible",
        "Avoid heavy blur or very dark lighting",
        "Avoid sunglasses or face-covering objects",
        "Use one main person per image",
        "Use a natural pose and expression"
    ];

    return (
        <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5">
            <h3 className="font-bold text-white">Photo quality checklist</h3>

            <p className="mt-2 text-sm leading-6 text-slate-400">
                Better input photos usually create better caricatures.
            </p>

            <div className="mt-4 grid gap-2">
                {guidelines.map((item) => (
                    <div key={item} className="flex items-start gap-3 text-sm text-slate-300">
                        <span className="mt-0.5 text-emerald-300">✓</span>
                        <span>{item}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}