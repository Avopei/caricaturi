"use client";

type AgingPromptPreviewProps = {
    prompt?: string;
};

export function AgingPromptPreview({ prompt }: AgingPromptPreviewProps) {
    if (!prompt) {
        return null;
    }

    return (
        <details className="rounded-xl border border-neutral-300 bg-white p-5 shadow-sm">
            <summary className="cursor-pointer text-sm font-black uppercase tracking-[0.18em] text-neutral-600">
                Advanced prompt
            </summary>
            <pre className="mt-4 max-h-80 overflow-auto whitespace-pre-wrap rounded-lg bg-neutral-950 p-4 text-xs leading-5 text-neutral-100">
                {prompt}
            </pre>
        </details>
    );
}
