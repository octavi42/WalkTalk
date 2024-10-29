import { createClient } from "@deepgram/sdk";
import fs from 'fs'
import { pipeline } from 'stream/promises'
import { Readable } from 'stream';

const text = "Born and raised in the charming south, I can add a touch of sweet southern hospitality to your audiobooks and podcasts. Explanation of Key Adjustments Try-Catch Parsing for Each Line: Each line is now wrapped in a try-catch block to handle any issues with incomplete or malformed JSON. If parsing fails, it logs the error and skips that line instead of halting the process. Preserve Incomplete Data: partialData stores any incomplete line and carries it over to the next chunk to ensure only full JSON strings are parsed. Error Logging: Detailed logs on parsing errors will help identify if any specific part of the data causes issues. This should help prevent Unexpected end of JSON input errors by handling each line more cautiously, parsing only fully completed JSON strings.";
const chatStreamUrl = "http://localhost:8081/api/gpt_stream";
const deepgram = createClient(process.env.DEEPGRAM_API_KEY);
const outputFile = 'audio.mp3';

export async function GET(request: Request) {
    // Fetch the text stream from ChatGPT endpoint
    const chatResponse = await fetch(chatStreamUrl);
    const chatStreamReader = chatResponse.body?.getReader();

    if (!chatStreamReader) {
        return new Response("Failed to read ChatGPT stream", { status: 500 });
    }

    let isStreamClosed = false;
    const audioStream = new ReadableStream({
        async start(controller) {
            async function processTextToAudio(textChunk: string) {
                // Send each text chunk to Deepgram for audio conversion
                const deepgramResponse = await deepgram.speak.request(
                    { text: textChunk },
                    { model: "aura-asteria-en" }
                );

                const audioStreamReader = (await deepgramResponse.getStream()).getReader();

                while (true) {
                    const { done, value } = await audioStreamReader.read();
                    if (done) break;
                    if (value && !isStreamClosed) {
                        controller.enqueue(value); // Stream each audio chunk
                    }
                }

                console.log("Finished processing audio for chunk.");
            }

            // Continuously read chunks from ChatGPT and process them
            while (true) {
                const { done, value } = await chatStreamReader.read();
                if (done) break;
                const textChunk = new TextDecoder().decode(value);
                await processTextToAudio(textChunk);
            }

            // Close the stream after processing all chunks
            if (!isStreamClosed) {
                isStreamClosed = true;
                controller.close();
            }
        },
        cancel() {
            isStreamClosed = true;
        }
    });

    return new Response(audioStream, {
        headers: { "Content-Type": "audio/mpeg", "Transfer-Encoding": "chunked" },
    });
}
