import Handlebars from "handlebars";
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

export class TemplateEngine {
  private readonly template: HandlebarsTemplateDelegate<any>;

  private constructor(templateText: string) {
    this.template = Handlebars.compile(templateText);
  }

  static async load(templatePath: string): Promise<TemplateEngine> {
    const dirName = path.dirname(fileURLToPath(import.meta.url));
    const templateFile = await fs.readFile(
      path.join(dirName, "../templates", templatePath),
      {
        encoding: "utf-8",
      }
    );
    return new TemplateEngine(templateFile);
  }

  render(context: any, options?: Handlebars.RuntimeOptions): string {
    return this.template(context, options);
  }
}
