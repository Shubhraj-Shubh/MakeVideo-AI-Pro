
// import {
//   GoogleGenAI,
// } from '@google/genai';
import { NextResponse } from "next/server";
import { db } from "@/config/db";
import { videosTable } from "@/config/schema";
import Replicate from "replicate";
const replicate = new Replicate();


// const PROMPT=`Create a short, high-quality cinematic video prompt that can be fed to a video generation AI. 
// Conditions:
// - Video length: 5-10 seconds
// - Aspect ratio: 16:9
// - Style: vivid colors, smooth transitions, clarity, realism
// - Content must faithfully represent the user's description
// - Keep it concise but descriptive enough for AI video generation
// Return ONLY the enhanced prompt as plain text string, do NOT include JSON or explanation
// Based on the following user input: `

  
// const ai = new GoogleGenAI({
//     apiKey: process.env.GEMINI_API_KEY,
//   });

  
export async function POST(req){

    try{
    const body = await req.json();  
    const userPrompt = body.formPrompt;

//   const config = {
//     responseMimeType: 'text/plain',
//   };
//   const model = 'gemini-2.0-flash';
//   const contents = [
//     {
//       role: 'user',
//       parts: [
//         {
//           text: PROMPT + JSON.stringify(userPrompt),
//         },
//       ],
//     },
//   ];

//   const response = await ai.models.generateContent({
//     model,
//     config,
//     contents,
//   });
 
//   const enhancedPrompt = response?.candidates?.[0]?.content?.parts?.[0]?.text || userPrompt;

const input = {
    fps: 24,
    width: 1024,
    height: 576,
    prompt: userPrompt,
    guidance_scale: 17.5,
    remove_watermark: true
};

let output=null;
let videoUrl=null;
let responseString=null;

try{
 output = await replicate.run("anotherjesse/zeroscope-v2-xl:9f747673945c62801b13b84701c783929c0ee784e4748ec062204894dda1a351", { input });

 videoUrl = Array.isArray(output) && output.length > 0 ? output[0] : null;

 responseString="Video Created, Check in Explore Videos Section";
}
catch (replicateError) {
      // Replicate failed (likely credits expired)
      console.error("Replicate error:", replicateError);
      // Fallback video URL
      videoUrl = "https://www.w3schools.com/html/mov_bbb.mp4";

       responseString="Replicate Credit Expired, Returned fallback video";
    }

console.log(videoUrl);

  // Save to Database
await db.insert(videosTable).values({
  prompt: userPrompt,        // user ka original / enhanced prompt
  videoUrl:videoUrl , // JSON string of URLs
});

 
  return NextResponse.json(responseString);
    } catch (error) {
    console.error(error);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}







 