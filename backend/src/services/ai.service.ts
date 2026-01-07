import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export class AIService {
  static async extractDocumentData(documentText: string, fields: string[]): Promise<any> {
    const prompt = `Extract the following fields from this document: ${fields.join(', ')}\n\nDocument:\n${documentText}\n\nReturn as JSON.`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.3,
    });

    return JSON.parse(response.choices[0].message.content || '{}');
  }

  static async generateDocumentContent(prompt: string, context: any): Promise<string> {
    const fullPrompt = `Generate professional document content for: ${prompt}\n\nContext: ${JSON.stringify(context)}`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [{ role: 'user', content: fullPrompt }],
      temperature: 0.7,
    });

    return response.choices[0].message.content || '';
  }

  static async classifyDocument(documentText: string): Promise<{ category: string; confidence: number }> {
    const prompt = `Classify this document into one of these categories: Contract, Policy, Training Material, Compliance Report, Procedure, Other.\n\nDocument:\n${documentText.substring(0, 1000)}\n\nReturn JSON with category and confidence (0-1).`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.2,
    });

    return JSON.parse(response.choices[0].message.content || '{"category":"Other","confidence":0}');
  }

  static async suggestImprovements(documentText: string): Promise<string[]> {
    const prompt = `Review this document and suggest improvements for clarity, compliance, and professionalism:\n\n${documentText.substring(0, 2000)}`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.5,
    });

    return response.choices[0].message.content?.split('\n').filter(s => s.trim()) || [];
  }
}
