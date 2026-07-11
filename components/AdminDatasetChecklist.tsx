export function AdminDatasetChecklist() {
    const goodRules = [
        "Identity is clearly recognizable",
        "Original pose and expression are preserved",
        "No invented smile, teeth, props, or background details",
        "Linework looks natural and hand-drawn",
        "Caricature exaggeration is subtle and controlled",
        "No distorted eyes, mouth, nose, jaw, or hands",
        "Final image is unlocked or downloaded by the user",
        "User feedback is positive or admin rating is 4–5"
    ];

    const badRules = [
        "Face looks like a different person",
        "Expression changed too much",
        "AI added a smile, teeth, props, or random details",
        "Output looks glossy, plastic, or too digital",
        "Extreme cartoon deformation",
        "Bad anatomy, broken facial features, or messy linework",
        "Low quality original photo",
        "Admin rating below 4"
    ];

    return (
        <section className="mx-auto mt-8 max-w-7xl rounded-xl border border-neutral-300 bg-white p-6">
            <div>
                <h2 className="text-xl font-black">LoRA dataset quality rules</h2>

                <p className="mt-1 text-sm leading-6 text-neutral-500">
                    Use these rules before selecting generations for future LoRA training.
                    A smaller clean dataset is better than a large noisy one.
                </p>
            </div>

            <div className="mt-6 grid gap-5 lg:grid-cols-2">
                <div className="rounded-xl border border-neutral-300 bg-neutral-100 p-5">
                    <h3 className="font-black text-neutral-700">
                        Select for training when:
                    </h3>

                    <div className="mt-4 grid gap-3">
                        {goodRules.map((rule) => (
                            <div key={rule} className="flex gap-3 text-sm text-neutral-700">
                                <span className="text-emerald-300">✓</span>
                                <span>{rule}</span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="rounded-xl border border-red-300 bg-red-50 p-5">
                    <h3 className="font-black text-red-700">
                        Do not select when:
                    </h3>

                    <div className="mt-4 grid gap-3">
                        {badRules.map((rule) => (
                            <div key={rule} className="flex gap-3 text-sm text-neutral-700">
                                <span className="text-red-300">×</span>
                                <span>{rule}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="mt-6 rounded-xl border border-neutral-300 bg-neutral-50 p-5">
                <h3 className="font-black text-neutral-950">
                    Recommended LoRA dataset target
                </h3>

                <div className="mt-4 grid gap-4 md:grid-cols-3">
                    <div className="rounded-lg bg-neutral-50 p-4">
                        <p className="text-sm text-neutral-500">Minimum</p>
                        <p className="mt-2 text-2xl font-black text-neutral-950">30–50</p>
                        <p className="mt-1 text-xs text-neutral-500">clean examples</p>
                    </div>

                    <div className="rounded-lg bg-neutral-50 p-4">
                        <p className="text-sm text-neutral-500">Better</p>
                        <p className="mt-2 text-2xl font-black text-neutral-950">100–200</p>
                        <p className="mt-1 text-xs text-neutral-500">rated examples</p>
                    </div>

                    <div className="rounded-lg bg-neutral-50 p-4">
                        <p className="text-sm text-neutral-500">Use only</p>
                        <p className="mt-2 text-2xl font-black text-neutral-950">4–5★</p>
                        <p className="mt-1 text-xs text-neutral-500">admin-rated outputs</p>
                    </div>
                </div>
            </div>
        </section>
    );
}