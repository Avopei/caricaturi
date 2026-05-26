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
        <section className="mx-auto mt-8 max-w-7xl rounded-3xl border border-white/10 bg-white/[0.04] p-6">
            <div>
                <h2 className="text-xl font-black">LoRA dataset quality rules</h2>

                <p className="mt-1 text-sm leading-6 text-slate-400">
                    Use these rules before selecting generations for future LoRA training.
                    A smaller clean dataset is better than a large noisy one.
                </p>
            </div>

            <div className="mt-6 grid gap-5 lg:grid-cols-2">
                <div className="rounded-3xl border border-emerald-500/20 bg-emerald-500/10 p-5">
                    <h3 className="font-black text-emerald-200">
                        Select for training when:
                    </h3>

                    <div className="mt-4 grid gap-3">
                        {goodRules.map((rule) => (
                            <div key={rule} className="flex gap-3 text-sm text-slate-200">
                                <span className="text-emerald-300">✓</span>
                                <span>{rule}</span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="rounded-3xl border border-red-500/20 bg-red-500/10 p-5">
                    <h3 className="font-black text-red-200">
                        Do not select when:
                    </h3>

                    <div className="mt-4 grid gap-3">
                        {badRules.map((rule) => (
                            <div key={rule} className="flex gap-3 text-sm text-slate-200">
                                <span className="text-red-300">×</span>
                                <span>{rule}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="mt-6 rounded-3xl border border-violet-500/20 bg-violet-500/10 p-5">
                <h3 className="font-black text-violet-100">
                    Recommended LoRA dataset target
                </h3>

                <div className="mt-4 grid gap-4 md:grid-cols-3">
                    <div className="rounded-2xl bg-slate-950 p-4">
                        <p className="text-sm text-slate-400">Minimum</p>
                        <p className="mt-2 text-2xl font-black text-white">30–50</p>
                        <p className="mt-1 text-xs text-slate-500">clean examples</p>
                    </div>

                    <div className="rounded-2xl bg-slate-950 p-4">
                        <p className="text-sm text-slate-400">Better</p>
                        <p className="mt-2 text-2xl font-black text-white">100–200</p>
                        <p className="mt-1 text-xs text-slate-500">rated examples</p>
                    </div>

                    <div className="rounded-2xl bg-slate-950 p-4">
                        <p className="text-sm text-slate-400">Use only</p>
                        <p className="mt-2 text-2xl font-black text-white">4–5★</p>
                        <p className="mt-1 text-xs text-slate-500">admin-rated outputs</p>
                    </div>
                </div>
            </div>
        </section>
    );
}