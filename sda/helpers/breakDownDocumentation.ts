export default function breakDownDocumentation(
  sdaDocs: string,
  sample: number,
) {
  console.log("\n2 - Breaking down the documentation...");

  let documentationChunksSda = [];

  const sdaIntro = sdaDocs.split("## class SimpleDB")[0].trim();
  const SimpleDBIntro = "## class SimpleDB\n" +
    sdaDocs.split("## class SimpleDB")[1].split("### Methods")[0].trim();
  const SimpleDBMethods = sdaDocs.split("## class SimpleDB")[1].split(
    "### Methods",
  )[1].split(
    "## class SimpleTable",
  )[0].split("\n#### ").filter((d) => d.trim().length > 100).map((d) =>
    "\n#### " + d.trim()
  );

  const SimpleTableIntro = "## class SimpleTable\n" +
    sdaDocs.split("## class SimpleTable")[1].split("### Methods")[0].trim();
  const SimpleTableMethods = sdaDocs.split("## class SimpleTable")[1].split(
    "### Methods",
  )[1].split(
    "## class SimpleView",
  )[0].split("\n#### ").filter((d) => d.trim().length > 100).map((d) =>
    "\n#### " + d.trim()
  );

  console.log("\nMethods for SDA");
  console.log("SimpleDBMethods:", SimpleDBMethods.length);
  console.log("SimpleTableMethods:", SimpleTableMethods.length);

  documentationChunksSda.push(sdaIntro);
  documentationChunksSda.push(SimpleDBIntro);
  documentationChunksSda.push(...SimpleDBMethods);
  documentationChunksSda.push(SimpleTableIntro);
  documentationChunksSda.push(...SimpleTableMethods);

  if (sample) {
    documentationChunksSda = documentationChunksSda.slice(0, sample);
  }

  console.log("\nAll chuncks for SDA:", documentationChunksSda.length);

  return documentationChunksSda;
}
