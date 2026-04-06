import { describe, it, expect } from "vitest";
import {
  type LLMConfig,
} from "../../src/lib/llm";

describe("LLM Config", () => {
  it("should have correct type", () => {
    const cfg: LLMConfig = {
      baseUrl: "http://localhost:11434",
      model: "qwen2.5",
      provider: "ollama",
    };
    expect(cfg.provider).toBe("ollama");
    expect(cfg.model).toBe("qwen2.5");
    expect(cfg.baseUrl).toContain("localhost");
  });

  it("should accept lmstudio provider", () => {
    const cfg: LLMConfig = {
      baseUrl: "http://localhost:1234",
      model: "qwen2.5",
      provider: "lmstudio",
    };
    expect(cfg.provider).toBe("lmstudio");
  });

  it("should accept localai provider", () => {
    const cfg: LLMConfig = {
      baseUrl: "http://localhost:8080",
      model: "qwen2.5",
      provider: "localai",
    };
    expect(cfg.provider).toBe("localai");
  });
});
