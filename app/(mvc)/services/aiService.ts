import OpenAI from "openai";

export class AIService {
  private openai: OpenAI;

  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }

  async generateResponse(message: string): Promise<string> {
    const completion = await this.openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: message }],
    });

    return (
      completion.choices[0].message.content || "Désolé, je n'ai pas de réponse."
    );
  }
}
