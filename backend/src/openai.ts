import OpenAI from 'openai';
import * as fs from 'node:fs';
import {ResponseFormatTextConfig} from 'openai/src/resources/responses/responses';

const client = new OpenAI();

export async function transcribeAudio(audioPath: string) {
    const transcript = await client.audio.transcriptions.create({
        file: fs.createReadStream(audioPath),
        model: 'gpt-4o-transcribe',
        prompt: 'You are a transcription assistant for home health nurses. Transcribe the following patient encounter audio.',
    });
    return transcript.text;
}

export async function generateResponse<T extends ResponseFormatTextConfig>(prompt: string, input: string, format: T) {
    const response = await client.responses.parse({
        model: 'gpt-4.1-mini',
        input: [
            {role: 'system', content: prompt},
            {role: 'user', content: input}
        ],
        text: {
            format
        }
    });
    return response.output_parsed;
}
