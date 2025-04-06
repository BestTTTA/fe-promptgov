import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

if (!process.env.GOOGLE_API_KEY) {
    throw new Error('GOOGLE_API_KEY is not defined in the environment variables.');
}

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);

async function retryGenerateContent(model: any, prompt: string, retries: number = 3, delay: number = 1000): Promise<any> {
    for (let attempt = 1; attempt <= retries; attempt++) {
        try {
            console.info(`Attempt ${attempt} to generate content...`);
            const result = await model.generateContent(prompt);
            return result;
        } catch (error) {
            if (attempt < retries && error instanceof Error && error.message.includes('503')) {
                console.warn(`Attempt ${attempt} failed. Retrying in ${delay}ms...`);
                await new Promise(resolve => setTimeout(resolve, delay));
            } else if (error instanceof Error) {
                console.error(`Error on attempt ${attempt}:`, error.message);
                throw error;
            } else {
                console.error(`Unexpected error on attempt ${attempt}:`, error);
                throw new Error('Unexpected error occurred.');
            }
        }
    }
    console.error('Max retries reached. Service is unavailable.');
    throw new Error('Max retries reached. The service is currently unavailable.');
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const prompt = body.prompt;

        if (!prompt) {
            return NextResponse.json(
                { error: 'Prompt is required.' },
                { status: 400 }
            );
        }

        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
        const result = await retryGenerateContent(model, prompt);

        let text: string;
        if (result.response && typeof result.response.text === 'function') {
            text = await result.response.text();
        } else if (typeof result.response === 'string') {
            text = result.response;
        } else {
            text = JSON.stringify(result.response);
        }

        const jsonRegex = /```json\s*([\s\S]*?)\s*```/;
        const match = text.match(jsonRegex);
        const jsonString = match ? match[1] : text;

        let jsonData;
        try {
            jsonData = JSON.parse(jsonString);
            console.log(jsonData);
        } catch (parseError) {
            jsonData = jsonString;
        }

        return NextResponse.json(
            { message: 'Success', data: jsonData },
            { status: 200 }
        );
    } catch (error) {
        if (error instanceof Error && error.message.includes('503')) {
            console.error('Service is currently unavailable after retries:', error);
            return NextResponse.json(
                { 
                    error: 'The service is currently unavailable after multiple attempts. Please try again later. If the issue persists, contact support or check the system status.' 
                },
                { status: 503 }
            );
        }

        console.error('Unexpected error:', error);
        return NextResponse.json(
            { error: 'An unexpected error occurred. Please try again later.' },
            { status: 500 }
        );
    }
}
