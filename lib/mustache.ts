import { Generator, ValidateInput } from "code-skeleton/lib/generators/abstract";
import { GeneratorReportResult } from "code-skeleton/lib/generators/report";
import { readFile } from "node:fs/promises";
import Mustache from "mustache";
Mustache.tags = [ "<%", "%>" ];

interface MustacheGeneratorOptions {
  sourcePath: string;
  variables: unknown;
}

class MustacheGenerator extends Generator<MustacheGeneratorOptions> {
  declare options: MustacheGeneratorOptions;

  constructor (options: MustacheGeneratorOptions) {
    super(options);

    if (!this.options.sourcePath) {
      throw new Error("Must specify a source path");
    }
  }

  async generate () {
    const source = await readFile(this.options.sourcePath);

    const rendered = Mustache.render(source.toString(), this.options.variables);
    return rendered;
  }

  async validate(options: ValidateInput) : Promise<GeneratorReportResult> {
    const expected = await this.generate();

    if (!options.found.includes(expected)) {
      this.report({
        expected,
        found: options.found,
        message: `${this.options.sourcePath} does not include the original template`
      });
      return GeneratorReportResult.Fail;
    }
    return GeneratorReportResult.Pass;
  }
}

export function mustache (options: MustacheGeneratorOptions) {
  return new MustacheGenerator(options);
}
