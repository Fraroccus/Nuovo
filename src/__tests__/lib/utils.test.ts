import { formatCurrency, formatDate, cn } from "@/lib/utils";

describe("Utils", () => {
  describe("formatCurrency", () => {
    it("formats currency correctly", () => {
      expect(formatCurrency(1234.56)).toBe("$1,234.56");
      expect(formatCurrency(0)).toBe("$0.00");
      expect(formatCurrency(999.99)).toBe("$999.99");
    });
  });

  describe("formatDate", () => {
    it("formats dates correctly", () => {
      const date = new Date("2024-01-15");
      const formatted = formatDate(date);
      expect(formatted).toContain("January");
      expect(formatted).toContain("15");
      expect(formatted).toContain("2024");
    });
  });

  describe("cn", () => {
    it("joins class names", () => {
      expect(cn("class1", "class2")).toBe("class1 class2");
    });

    it("filters out falsy values", () => {
      expect(cn("class1", false, "class2", null, "class3")).toBe(
        "class1 class2 class3"
      );
    });

    it("handles empty input", () => {
      expect(cn()).toBe("");
    });
  });
});
