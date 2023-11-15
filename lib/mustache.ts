import { Generator } from "code-skeleton/lib/generators/abstract";
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
}

export function mustache (options: MustacheGeneratorOptions) {
  return new MustacheGenerator(options);
}
