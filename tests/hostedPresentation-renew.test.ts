import { describe, expect, mock, test } from "bun:test";

const updateMany = mock().mockResolvedValue({ count: 1 });

mock.module("../src/db", () => ({
  db: {
    hostedPresentation: {
      updateMany,
    },
  },
}));

describe("renew", () => {
  test("updates createdAt scoped to id and userId", async () => {
    const { default: renew } = await import(
      "../src/database/hostedPresentation/renew"
    );
    await renew("uuid-1", 42);
    expect(updateMany).toHaveBeenCalledWith({
      where: { id: "uuid-1", userId: 42 },
      data: { createdAt: expect.any(Date) },
    });
  });

  test("returns { count: 0 } when the row is not owned by the user", async () => {
    updateMany.mockResolvedValue({ count: 0 });
    const { default: renew } = await import(
      "../src/database/hostedPresentation/renew"
    );
    const res = await renew("uuid-2", 42);
    expect(res).toEqual({ count: 0 });
  });
});
