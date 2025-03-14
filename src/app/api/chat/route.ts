import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY!);

export async function POST(request: Request) {
    try {
        const body = await request.json();

        const prompt = body.prompt;
        
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
        const result = await model.generateContent(prompt);

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
            console.log(jsonData)
        } catch (parseError) {
            jsonData = jsonString;
        }

        return NextResponse.json(
            { message: 'Success', data: jsonData },
            { status: 200 }
        );
    } catch (error) {
        console.error('Error:', error);
        return NextResponse.json(
            { error: 'Internal Server Error' },
            { status: 500 }
        );
    }
}
