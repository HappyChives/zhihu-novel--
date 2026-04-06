import { useState, useCallback } from "react";
import { useApp } from "../lib/context";
import { streamLLM } from "../lib/llm";
import type { LLMConfig } from "../lib/types";

export function useLLM() {
  const { config } = useApp();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const call = useCallback(
    async (systemPrompt: string, userPrompt: string): Promise<string> => {
      setLoading(true);
      setError(null);

      try {
        let full = "";
        for await (const chunk of streamLLM(config.llm as LLMConfig, systemPrompt, userPrompt)) {
          full += chunk;
        }
        return full;
      } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : "未知错误";
        setError(msg);
        throw e;
      } finally {
        setLoading(false);
      }
    },
    [config.llm]
  );

  const stream = useCallback(
    async function* (
      systemPrompt: string,
      userPrompt: string
    ): AsyncGenerator<string, void, unknown> {
      setLoading(true);
      setError(null);
      try {
        yield* streamLLM(config.llm as LLMConfig, systemPrompt, userPrompt);
      } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : "未知错误";
        setError(msg);
        throw e;
      } finally {
        setLoading(false);
      }
    },
    [config.llm]
  );

  return { call, stream, loading, error };
}
