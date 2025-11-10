import promptFineTunedModel from "./promptFineTunedModel.ts";

export default async function generateModelResponse(
  model: {
    name: string;
    mlx: string;
    type: string;
  },
  questions: {
    question: string;
    keyword: string[];
  }[],
) {
  console.log(
    `\nGenerating responses from fine-tuned model ${model.name}...\n`,
  );

  const modelResponses = [];

  const adapterPath = `models/${model.name}/adapters`;

  console.log(adapterPath);

  for (const question of questions) {
    const response = await promptFineTunedModel(
      model,
      adapterPath,
      question.question,
    );

    modelResponses.push({
      model: model.name,
      question: question.question,
      response,
    });

    console.log(`\n- Question: ${question.question}`);
    console.log(`\n- Response: ${response}`);
  }

  Deno.writeTextFileSync(
    `models/${model.name}/responses.json`,
    JSON.stringify(modelResponses, null, 2),
  );

  console.log(
    `\nCompleted generating responses from fine-tuned model ${model.name}.\n`,
  );
}
