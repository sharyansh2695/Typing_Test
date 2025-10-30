import { query } from "./_generated/server";

export const getTimeSetting = query({
  args: {},
  handler: async (ctx) => {
    // get the first record (you can expand this later to select by difficulty)
    const setting = await ctx.db.query("timeSettings").first();
    return setting ?? { duration: 60 }; // default 60s if not found
  },
});
