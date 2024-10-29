import { createClient } from "@deepgram/sdk";
import fs from 'fs'
import { pipeline } from 'stream/promises'
import { Readable } from 'stream';

const text = "Born and raised in the charming south, I can add a touch of sweet southern hospitality to your audiobooks and podcasts. Explanation of Key Adjustments Try-Catch Parsing for Each Line: Each line is now wrapped in a try-catch block to handle any issues with incomplete or malformed JSON. If parsing fails, it logs the error and skips that line instead of halting the process. Preserve Incomplete Data: partialData stores any incomplete line and carries it over to the next chunk to ensure only full JSON strings are parsed. Error Logging: Detailed logs on parsing errors will help identify if any specific part of the data causes issues. This should help prevent Unexpected end of JSON input errors by handling each line more cautiously, parsing only fully completed JSON strings.";
const chatStreamUrl = "http://localhost:8081/api/gpt_stream";
const deepgram = createClient(process.env.DEEPGRAM_API_KEY);

export async function GET(request: Request) {
    const outputFile = 'audio.mp3';

    const response = await deepgram.speak.request(
        { text },
        {
            model: 'aura-asteria-en',
            diarization: true
        }
    );

    const stream = await response.getStream();
  if (stream) {
    const file = fs.createWriteStream(outputFile);
    try {
      await pipeline(stream, file);

        console.log(stream.getReader());
        
      console.log(`Audio file written to ${outputFile}`);
    } catch (e) {
      console.error('Error writing audio to file:', err);
    }
  } else {
    console.error('Error generating audio:', stream);
  }

//   try {
//     // Log headers
//     console.log('Headers:', response.result?.headers);
  
//     // Check if the response is JSON based on the Content-Type
//     const contentType = response.result?.headers.get("Content-Type");
    
//     if (contentType && contentType.includes("application/json")) {
//       // Parse and log JSON if the content type is JSON
//       const jsonResponse = await response.result.json();
//       console.log('JSON Response:', jsonResponse);
//     } else {
//       // Fallback to text parsing if it's not JSON
//       const textResponse = await response.result.text();
//       console.log('Text Response:', textResponse);
//     }
//   } catch (error) {
//     console.error('Error reading response:', error);
//   }
  
  
  

    return new Response(response.result);
}
