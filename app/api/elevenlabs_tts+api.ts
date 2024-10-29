import * as fs from "fs";
import fetch from "node-fetch";
import { pipeline } from "stream";
import { Writable } from "stream";

const VOICE_ID = "9BWtsMINqrJLrRacOk9x"; // Rachel
const YOUR_XI_API_KEY = process.env.ELEVENLABS_API_KEY;

export async function GET(request: Request) {
    if (!YOUR_XI_API_KEY) {
        console.error("API key is missing.");
        return new Response("Server Error: Missing API Key", { status: 500 });
    }

    const url = `https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}/stream/with-timestamps`;
    const headers = {
        "Content-Type": "application/json",
        "xi-api-key": YOUR_XI_API_KEY
    };
    
    const data = {
        text: "Born and raised in the charming south, I can add a touch of sweet southern hospitality to your audiobooks and podcasts. Explanation of Key Adjustments Try-Catch Parsing for Each Line: Each line is now wrapped in a try-catch block to handle any issues with incomplete or malformed JSON. If parsing fails, it logs the error and skips that line instead of halting the process. Preserve Incomplete Data: partialData stores any incomplete line and carries it over to the next chunk to ensure only full JSON strings are parsed. Error Logging: Detailed logs on parsing errors will help identify if any specific part of the data causes issues. This should help prevent Unexpected end of JSON input errors by handling each line more cautiously, parsing only fully completed JSON strings.",
        model_id: "eleven_multilingual_v2",
        voice_settings: {
            stability: 0.5,
            similarity_boost: 0.75
        }
    };

    try {
        // Send request to Eleven Labs API
        const response = await fetch(url, {
            method: "POST",
            headers,
            body: JSON.stringify(data)
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error(`Error encountered, status: ${response.status}, content: ${errorText}`);
            return new Response(`Error: ${errorText}`, { status: response.status });
        }

        console.log("Processing audio stream...");
        
        const audioBytes: Buffer[] = [];
        const characters: string[] = [];
        const characterStartTimesSeconds: number[] = [];
        const characterEndTimesSeconds: number[] = [];
        let partialData = "";  // Buffer for incomplete lines

        await new Promise((resolve, reject) => {
            pipeline(
                response.body as NodeJS.ReadableStream,
                new Writable({
                    write(chunk, encoding, callback) {
                        // Convert chunk to text and append any partial data
                        partialData += chunk.toString("utf-8");
                        const lines = partialData.split("\n");

                        // Process all complete lines, keep the last part (incomplete) in `partialData`
                        lines.slice(0, -1).forEach(line => {
                            try {
                                const responseDict = JSON.parse(line);

                                // Process audio base64 chunks
                                const audioBase64 = responseDict["audio_base64"];
                                if (audioBase64) {
                                    const audioBytesChunk = Buffer.from(audioBase64, "base64");
                                    audioBytes.push(audioBytesChunk);
                                }

                                // Collect alignment data
                                const alignment = responseDict["alignment"];
                                if (alignment) {
                                    characters.push(...alignment.characters);
                                    characterStartTimesSeconds.push(...alignment.character_start_times_seconds);
                                    characterEndTimesSeconds.push(...alignment.character_end_times_seconds);
                                }
                            } catch (error) {
                                console.error("Failed to parse JSON line:", line, error);
                            }
                        });

                        // Update `partialData` with the last incomplete line
                        partialData = lines[lines.length - 1];
                        callback();
                    }
                }),
                (error) => {
                    if (error) {
                        console.error("Error in pipeline:", error);
                        reject(error);
                    } else {
                        resolve(undefined);
                    }
                }
            );
        });

        // Save the audio file
        const finalAudioBuffer = Buffer.concat(audioBytes);
        fs.writeFileSync("output.mp3", finalAudioBuffer);
        console.log("Audio saved to output.mp3");

        // Log alignment data
        console.log({
            characters,
            character_start_times_seconds: characterStartTimesSeconds,
            character_end_times_seconds: characterEndTimesSeconds
        });

        return new Response("Audio processing complete", { status: 200 });

    } catch (error) {
        console.error("Error during text-to-speech processing:", error);
        return new Response("Server Error: Processing failed", { status: 500 });
    }
}
