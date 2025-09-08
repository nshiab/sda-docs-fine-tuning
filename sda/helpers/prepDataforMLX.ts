export default function prepDataforMLX(
  trainingData: { question: string; answer: string }[],
) {
  console.log("\n4 - Restructuring and splitting the training data...");

  const trainingDataMLX = trainingData.map(({ question, answer }) => ({
    prompt: question,
    completion: answer,
  }));

  // Validate the data before proceeding
  const validTrainingData = validateTrainingData(trainingDataMLX);

  // Shuffle the data
  shuffleArray(validTrainingData);

  // Split: 95% train, 5% valid, 0% test
  // No sure how to test for now
  const total = validTrainingData.length;
  const trainCount = Math.floor(total * 0.95);
  const validCount = Math.floor(total * 0.05);

  const trainSet = validTrainingData.slice(0, trainCount);
  const validSet = validTrainingData.slice(trainCount, trainCount + validCount);
  const testSet = validTrainingData.slice(trainCount + validCount);

  function writeJsonlFile(
    path: string,
    data: { prompt: string; completion: string }[],
  ) {
    const lines = data.map((item) => JSON.stringify(item)).join("\n");
    Deno.writeTextFileSync(path, lines);
  }

  writeJsonlFile("sda/output/train.jsonl", trainSet);
  writeJsonlFile("sda/output/valid.jsonl", validSet);
  writeJsonlFile("sda/output/test.jsonl", testSet);

  console.log("trainSet:", trainSet.length);
  console.log("validSet:", validSet.length);
  console.log("testSet:", testSet.length);

  return validTrainingData;
}

// Validate training data for MLX compatibility
function validateTrainingData(data: { prompt: string; completion: string }[]) {
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
          `⚠️  Skipping invalid entry ${index + 1}: ${problems.join(", ")}`,
        );
      }
    } else {
      validEntries.push(entry);
    }
  });

  if (invalidEntries > 0) {
    console.warn(
      `⚠️  Filtered out ${invalidEntries} invalid entries out of ${data.length} total entries`,
    );
    if (invalidEntries > 5) {
      console.warn(
        `   (showing first 5 issues, ${
          invalidEntries - 5
        } more filtered silently)`,
      );
    }
  }

  console.log(`✅ ${validEntries.length} valid training entries ready for MLX`);
  return validEntries;
}

// Shuffle function (Fisher-Yates)
function shuffleArray(array: { prompt: string; completion: string }[]) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}
