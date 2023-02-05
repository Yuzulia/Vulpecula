import Handlebars from "handlebars";
// import fs from "fs/promises";

export class TemplateEngine {
  private readonly template: HandlebarsTemplateDelegate<any>;

  private constructor(templateText: string) {
    this.template = Handlebars.compile(templateText);
  }

  static async load(templatePath: string): Promise<TemplateEngine> {
    const templateFile = await import(
      `../templates/${templatePath}.handlebars?raw`
    );
    return new TemplateEngine(templateFile.default);
  }

  render(context: any, options?: Handlebars.RuntimeOptions): string {
    return this.template(context, options);
  }
}
