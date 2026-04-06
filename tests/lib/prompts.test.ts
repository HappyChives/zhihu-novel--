import { describe, it, expect } from "vitest";
import {
  buildHotspotPrompt,
  buildInspirationPrompt,
  buildTopicPrompt,
  buildOutlinePrompt,
  buildWritingPrompt,
  buildPolishPrompt,
  buildCoverPrompt,
} from "../../src/prompts";

describe("Prompt Templates", () => {
  describe("buildHotspotPrompt", () => {
    it("should include raw data in user prompt", () => {
      const { system, user } = buildHotspotPrompt("test data");
      expect(user).toContain("test data");
      expect(system).toContain("网络文学市场");
    });
  });

  describe("buildInspirationPrompt", () => {
    it("should include mood in prompt", () => {
      const { system, user } = buildInspirationPrompt({ mood: "虐" });
      expect(user).toContain("虐");
    });

    it("should include genre when provided", () => {
      const { user } = buildInspirationPrompt({ mood: "爽", genre: "现代言情" });
      expect(user).toContain("现代言情");
    });

    it("should handle all mood types", () => {
      const moods = ["虐", "甜", "爽", "悬疑", "搞笑"];
      moods.forEach((mood) => {
        const { user } = buildInspirationPrompt({ mood });
        expect(user).toContain(mood);
      });
    });
  });

  describe("buildTopicPrompt", () => {
    it("should include inspiration text", () => {
      const { user } = buildTopicPrompt("some inspiration");
      expect(user).toContain("some inspiration");
    });
  });

  describe("buildOutlinePrompt", () => {
    it("should include topic in prompt", () => {
      const { user } = buildOutlinePrompt("topic text");
      expect(user).toContain("topic text");
    });

    it("should prefer selectedTopic over topicText", () => {
      const { user } = buildOutlinePrompt("general topic", "specific topic");
      expect(user).toContain("specific topic");
    });
  });

  describe("buildWritingPrompt", () => {
    it("should include outline in prompt", () => {
      const { user } = buildWritingPrompt({ outline: "test outline" });
      expect(user).toContain("test outline");
    });

    it("should include word count target", () => {
      const { user } = buildWritingPrompt({ outline: "test", wordCount: 5000 });
      expect(user).toContain("5000");
    });

    it("should include style in system prompt when provided", () => {
      const { system } = buildWritingPrompt({ outline: "test", style: "虐" });
      expect(system).toContain("虐");
    });
  });

  describe("buildPolishPrompt", () => {
    it("should include original text", () => {
      const { user } = buildPolishPrompt({ originalText: "original content", intent: "更虐" });
      expect(user).toContain("original content");
    });

    it("should include intent in prompt", () => {
      const { user } = buildPolishPrompt({ originalText: "test", intent: "精简" });
      expect(user).toContain("精简");
    });

    it("should handle all polish intents", () => {
      const intents = ["更虐", "更甜", "更悬疑", "更爽", "精简", "增细节", "调节奏", "强冲突"] as const;
      intents.forEach((intent) => {
        const { user } = buildPolishPrompt({ originalText: "test", intent });
        expect(user).toContain(intent);
      });
    });
  });

  describe("buildCoverPrompt", () => {
    it("should include topic when provided", () => {
      const { user } = buildCoverPrompt({ topic: "test topic" });
      expect(user).toContain("test topic");
    });

    it("should include coreConflict when provided", () => {
      const { user } = buildCoverPrompt({ coreConflict: "conflict text" });
      expect(user).toContain("conflict text");
    });

    it("should include all fields together", () => {
      const { user } = buildCoverPrompt({
        topic: "topic",
        coreConflict: "conflict",
        mood: "爽",
        genre: "现代言情",
        outline: "outline",
      });
      expect(user).toContain("topic");
      expect(user).toContain("conflict");
      expect(user).toContain("爽");
      expect(user).toContain("现代言情");
      expect(user).toContain("outline");
    });
  });
});
