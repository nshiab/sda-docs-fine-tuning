// Validate training data for MLX compatibility
export default function validateTrainingData(
  data: { prompt: string; completion: string }[],
) {
  console.log("Validating training data...");

  const validEntries: { prompt: string; completion: string }[] = [];
  let invalidEntries = 0;

  data.forEach((entry, index) => {
    const problems: string[] = [];

    // Check if prompt key exists and has valid value
    if (!("prompt" in entry)) {
      problems.push("missing prompt key");
    } else if (typeof entry.prompt !== "string") {
      problems.push("prompt is not a string");
    } else if (entry.prompt.trim() === "") {
      problems.push("prompt is empty");
    }

    // Check if completion key exists and has valid value
    if (!("completion" in entry)) {
      problems.push("missing completion key");
    } else if (typeof entry.completion !== "string") {
      problems.push("completion is not a string");
    } else if (entry.completion.trim() === "") {
      problems.push("completion is empty");
    }

    if (problems.length > 0) {
      invalidEntries++;

      // Log first few problematic entries for debugging
      if (invalidEntries <= 5) {
        console.warn(
          `Skipping invalid entry ${index + 1}: ${problems.join(", ")}`,
        );
      }
    } else {
      validEntries.push(entry);
    }
  });

  if (invalidEntries > 0) {
    console.warn(
      `Filtered out ${invalidEntries} invalid entries out of ${data.length} total entries`,
    );
    if (invalidEntries > 5) {
      console.warn(
        `   (showing first 5 issues, ${
          invalidEntries - 5
        } more filtered silently)`,
      );
    }
  }

  console.log(`${validEntries.length} valid training entries ready for MLX`);
  return validEntries;
}
