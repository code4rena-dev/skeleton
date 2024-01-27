import t from "tap";
import { mustache } from "../lib/mustache.ts";

void t.test("mustache", async (t) => {
  await t.test("must include a path", (t) => {
    // @ts-expect-error bad data on purpose
    t.throws(() => mustache({}));
    t.end();
  });

  await t.test("should generate", async (t) => {
    const { mustache } = t.mockRequire<typeof import("../lib/mustache.ts")>("../lib/mustache.ts", {
      "node:fs/promises": {
        readFile: (path: string) => {
          t.equal(path, "path/to/file.txt");
          return Promise.resolve("<% title %>");
        }
      }
    });
    const variables = {
      title: "it generates"
    };

    const generator = mustache({
      path: "path/to/file.txt",
      variables,
    });

    const output = await generator.generate();
    t.equal(output, "it generates");
  });

  await t.test("should validate partials", async (t) => {
    const { mustache } = t.mockRequire<typeof import("../lib/mustache.ts")>("../lib/mustache.ts", {
      "node:fs/promises": {
        readFile: () => Promise.resolve("<% title %>")
      }
    });
    const variables = {
      title: "it generates"
    };

    const generator = mustache({
      path: "path/to/file.txt",
      variables,
    });

    const generateSpy = t.sinon.spy(generator, "generate");
    const reportSpy = t.sinon.spy(generator, "report");

    await generator.validate({
      path: "path/to/file.txt",
      found: "it generates\nand handles extras"
    });

    t.equal(generateSpy.callCount, 1);
    // Report not called because we passed
    t.equal(reportSpy.callCount, 0);
  });

  await t.test("should fail validation when base template not found", async (t) => {
    const { mustache } = t.mockRequire<typeof import("../lib/mustache.ts")>("../lib/mustache.ts", {
      "node:fs/promises": {
        readFile: () => Promise.resolve("<% title %>")
      }
    });
    const variables = {
      title: "it generates"
    };

    const generator = mustache({
      path: "path/to/file.txt",
      variables,
    });

    const generateSpy = t.sinon.spy(generator, "generate");
    const reportSpy = t.sinon.spy(generator, "report");

    await generator.validate({
      path: "path/to/file.txt",
      found: "a new file"
    });

    t.equal(generateSpy.callCount, 1);
    t.ok(reportSpy.calledOnceWithExactly({
      expected: "it generates",
      found: "a new file",
      message: "path/to/file.txt does not include the original template"
    }));
  });
});