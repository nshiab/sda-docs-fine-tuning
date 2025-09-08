export default async function cleanAdapters() {
  console.log("🧹 Cleaning adapters directory...");

  try {
    // Check if adapters directory exists
    const adapteersDirExists = await Deno.stat("adapters").then(() => true)
      .catch(() => false);

    if (adapteersDirExists) {
      // Remove the entire adapters directory
      await Deno.remove("adapters", { recursive: true });
      console.log("   🗑️  Removed existing adapters directory");
    }

    // Create a fresh adapters directory
    await Deno.mkdir("adapters", { recursive: true });
    console.log("   📁 Created fresh adapters directory");

    console.log("✅ Adapters directory cleaned\n");
  } catch (error) {
    console.error("❌ Failed to clean adapters directory:", error);
    throw error;
  }
}
