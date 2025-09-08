import { existsSync } from "node:fs";

export default async function fetchDocumentation() {
  if (
    existsSync("sda/data/sdaDocs.md")
  ) {
    console.log("\n1 - Documentation already exists.");
    return Deno.readTextFileSync("sda/data/sdaDocs.md");
  } else {
    console.log("\n1 - Fetching latest SDA and journalism documentation...");
    const sdaDocsResponse = await fetch(
      "https://raw.githubusercontent.com/nshiab/simple-data-analysis/refs/heads/main/llm.md",
    );
    const sdaDocs = await sdaDocsResponse.text();
    Deno.writeTextFileSync("sda/data/sdaDocs.md", sdaDocs);
    return sdaDocs;
  }
}
