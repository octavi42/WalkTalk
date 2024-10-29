import OpenAI from 'openai';

export async function GET(request: Request) {

    const openai = new OpenAI();

    const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
            { role: "system", content: "You are a helpful assistant." },
            {
                role: "user",
                content: "Write a haiku about recursion in programming.",
            },
        ],
    });
    

    return completion.choices[0].message;
}