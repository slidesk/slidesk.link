import { describe, expect, mock, test } from "bun:test";

const findMany = mock().mockResolvedValue([]);

mock.module("../src/db", () => ({
  db: {
    hostedPresentation: {
      findMany,
    },
  },
}));

describe("getHostedsByUser", () => {
  test("sorts hosted presentations by createdAt descending", async () => {
    const { default: getHostedsByUser } = await import(
      "../src/database/hostedPresentation/getByUser"
    );
    await getHostedsByUser(42);
    expect(findMany).toHaveBeenCalledWith({
      where: { userId: { equals: 42 } },
      orderBy: { createdAt: "desc" },
    });
  });
});
