import validateTrainingData from "./validateTrainingData.ts";
import shuffleArray from "./shuffleArray.ts";

export default function prepDataforMLX(
  trainingData: { question: string; answer: string }[],
  trainingDataPerc: number,
  validationDataPerc: number,
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
  const trainCount = Math.floor(total * trainingDataPerc);
  const validCount = Math.floor(total * validationDataPerc);

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
