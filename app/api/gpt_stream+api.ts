import OpenAI from 'openai';

export async function GET(request: Request) {
    const openai = new OpenAI({ apiKey: "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" });

    const responseStream = new ReadableStream({
        async start(controller) {
            try {
                const response = await openai.chat.completions.create({
                    model: "gpt-4",
                    messages: [
                        { role: "system", content: "You are a helpful assistant." },
                        { role: "user", content: "give me a text about something" },
                    ],
                    stream: true,
                });

                // Use for-await-of to handle each chunk from the async iterator
                for await (const chunk of response) {
                    const textChunk = chunk.choices[0].delta?.content || '';
                    controller.enqueue(new TextEncoder().encode(textChunk));
                }

                // Close the stream once done
                controller.close();
            } catch (error) {
                console.error("Error initiating stream:", error);
                controller.error(error);
            }
        }
    });

    return new Response(responseStream, {
        headers: { "Content-Type": "text/event-stream" },
    });
}
