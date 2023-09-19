import {
  Generator,
  GeneratorResults,
  GeneratorOptions
} from "code-skeleton/lib/generators/abstract";
import { dirname } from "node:path";
import { writeFile, mkdir, readFile } from "node:fs/promises";
import Mustache from "mustache";
Mustache.tags = [ "<%", "%>" ];

interface MustacheGeneratorOptions extends GeneratorOptions {
  sourcePath: string;
}

class MustacheGenerator extends Generator {
  declare options: MustacheGeneratorOptions;

  constructor (options: MustacheGeneratorOptions) {
    super(options);

    if (!this.options.sourcePath) {
      throw new Error("Must specify a source path");
    }
  }

  async apply(targetPath: string): Promise<GeneratorResults> {
    await mkdir(dirname(targetPath), { recursive: true });
    try {
      const source = await readFile(this.options.sourcePath);

      const rendered = Mustache.render(source.toString(), this.options);
      await writeFile(targetPath, rendered);
      return this.pass();
    } catch (err) {
      const { code, message } = err as { code?: string; message: string };
      // istanbul ignore next - no need to test message fallback
      return this.fail(code ?? message);
    }
  }
  async verify(targetPath: string): Promise<GeneratorResults> {
    let actual;
    try {
      actual = await readFile(targetPath);
    } catch (err) {
      const { code, message } = err as { code?: string; message: string };
      // istanbul ignore next - no need to test passthrough throws
      if (code !== "ENOENT") {
        return this.fail(code ?? message);
      }

      return this.fail("file missing");
    }

    const source = await readFile(this.options.sourcePath);
    const expected = Buffer.from(Mustache.render(source.toString(), this.options));
    if (actual.compare(expected) === 0) {
      return this.pass();
    }

    return this.fail("contents do not match");
  }
}

export function mustache (sourcePath: string, options: GeneratorOptions = {}) {
  return new MustacheGenerator({
    ...options,
    sourcePath
  });
}