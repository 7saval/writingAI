import OpenAI from 'openai';
import dotenv from 'dotenv';

dotenv.config();

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function generateText(prompt: string): Promise<string> {
    try {
        const response = await client.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: [
                { role: 'system', content: 'You are a helpful assistant for a novelist.' },
                { role: 'user', content: prompt },
            ],
            max_tokens: 500,
        });
        return response.choices[0].message.content || '';
    } catch (error) {
        console.error('OpenAI API Error:', error);
        throw new Error('Failed to generate text');
    }
}
