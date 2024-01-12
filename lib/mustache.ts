import { ValidateInput } from "code-skeleton/lib/generators/abstract";
import { Generator } from "code-skeleton/lib/generators/abstract";
import { readFile } from "node:fs/promises";
import Mustache from "mustache";
Mustache.tags = [ "<%", "%>" ];

interface MustacheGeneratorOptions {
  path: string;
  variables: unknown;
}

class MustacheGenerator extends Generator<MustacheGeneratorOptions> {
  declare options: MustacheGeneratorOptions;

  constructor (options: MustacheGeneratorOptions) {
    super(options);

    if (!this.options.path) {
      throw new Error("Must specify a source path");
    }
  }

  async generate () {
    const source = await readFile(this.options.path);

    const rendered = Mustache.render(source.toString(), this.options.variables);
    return rendered;
  }

  async validate(options: ValidateInput) : Promise<void> {
    const expected = await this.generate();

    if (!options.found.includes(expected)) {
      this.report({
        expected,
        found: options.found,
        message: `${this.options.path} does not include the original template`
      });
    }
  }
}

export function mustache (options: MustacheGeneratorOptions) {
  return new MustacheGenerator(options);
}
