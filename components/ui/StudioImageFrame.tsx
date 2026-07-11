type StudioImageFrameProps = {
    label: string;
    eyebrow?: string;
    dark?: boolean;
};

export function StudioImageFrame({
                                     label,
                                     eyebrow,
                                     dark = false
                                 }: StudioImageFrameProps) {
    return (
        <div
            className={`relative overflow-hidden rounded-xl border ${
                dark
                    ? "border-white/15 bg-neutral-950 text-white"
                    : "border-neutral-300 bg-neutral-100 text-neutral-950"
            }`}
        >
            <div className="absolute inset-0 opacity-70 [background-image:linear-gradient(90deg,rgba(0,0,0,.08)_1px,transparent_1px),linear-gradient(rgba(0,0,0,.08)_1px,transparent_1px)] [background-size:26px_26px]" />
            <div
                className={`absolute inset-x-8 top-10 h-48 rounded-full border ${
                    dark ? "border-white/20 bg-white/5" : "border-black/10 bg-white/70"
                }`}
            />
            <div
                className={`relative mx-auto mt-16 flex aspect-[3/4] w-2/3 max-w-72 flex-col justify-end overflow-hidden rounded-t-full border ${
                    dark
                        ? "border-white/20 bg-neutral-800"
                        : "border-neutral-300 bg-white"
                }`}
            >
                <div
                    className={`mx-auto mb-16 h-28 w-28 rounded-full border-8 ${
                        dark
                            ? "border-neutral-950 bg-neutral-200"
                            : "border-white bg-neutral-300"
                    }`}
                />
                <div
                    className={`mx-auto h-36 w-52 rounded-t-full ${
                        dark ? "bg-neutral-200" : "bg-neutral-800"
                    }`}
                />
            </div>
            <div className="relative border-t border-current/10 bg-inherit p-5">
                {eyebrow && (
                    <p className="text-xs font-black uppercase tracking-[0.24em] opacity-60">
                        {eyebrow}
                    </p>
                )}
                <p className="mt-1 text-xl font-black">{label}</p>
            </div>
        </div>
    );
}
