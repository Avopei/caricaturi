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
        <div className="rounded-xl border border-neutral-300 bg-white p-5 shadow-sm">
            <h3 className="font-bold text-neutral-950">Photo quality checklist</h3>

            <p className="mt-2 text-sm leading-6 text-neutral-600">
                Better input photos usually create better caricatures.
            </p>

            <div className="mt-4 grid gap-2">
                {guidelines.map((item) => (
                    <div key={item} className="flex items-start gap-3 text-sm text-neutral-700">
                        <span className="mt-0.5 font-black text-black">-</span>
                        <span>{item}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}
