
import {
  GoogleGenAI,
} from '@google/genai';
import { NextResponse } from "next/server";
import { db } from "@/config/db";
import { videosTable } from "@/config/schema";
import Replicate from "replicate";
const replicate = new Replicate();
import fetch from 'node-fetch';


const HOST = process.env.MINIMAX_API_HOST || "https://api.minimax.io";
const MINIMAX_API_KEY = process.env.MINIMAX_API_KEY;
const MODEL = "MiniMax-Hailuo-02";

// Step 1: Submit video generation task
async function invokeVideoGeneration(prompt) {
  console.log("Submit video generation task");

  const response = await fetch("https://api.minimax.io/v1/video_generation", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${MINIMAX_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      prompt,
      model: MODEL,
      duration: 6,
      resolution: "1080P",
    }),
  });

  const data = await response.json();
  console.log("Response:", data);

  if (!data.task_id) throw new Error("Task ID not received from Minimax API");

  console.log("Video generation task submitted successfully, Task ID:", data.task_id);
  return data.task_id;
}

// Step 2: Poll for video generation status
async function queryVideoGeneration(taskId) {
  const response = await fetch(
    `https://api.minimax.io/v1/query/video_generation?task_id=${taskId}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${MINIMAX_API_KEY}`,
      },
    }
  );

  const data = await response.json();
  return data;
}

// Step 3: Fetch final video result
async function fetchVideoResult(fileId) {
  console.log("Video generated successfully, fetching download link");

  const response = await fetch(
    `https://api.minimax.io/v1/files/retrieve?file_id=${fileId}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${MINIMAX_API_KEY}`,
      },
    }
  );

  const data = await response.json();
  const downloadUrl = data.file?.download_url;

  if (!downloadUrl) throw new Error("Download URL not found!");

  console.log("Video download link:", downloadUrl);
  return downloadUrl;
}






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
let enhancedPrompt=userPrompt;



//     try{
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
 
//    enhancedPrompt = response?.candidates?.[0]?.content?.parts?.[0]?.text || userPrompt;
// }
// catch (geminiError){
//     console.error("Gemini error:", geminiError);
//     enhancedPrompt=userPrompt;
// }


let videoUrl=null;
let responseString=null;


try{
 // Step 1: Submit task
    const taskId = await invokeVideoGeneration(enhancedPrompt);

    console.log("Video generation task submitted ");

    // Step 2: Polling loop
    let fileId = null;
    let status = "Preparing";
    for (let i = 0; i < 30; i++) { // max 30 retries (~5 min)
      await new Promise((resolve) => setTimeout(resolve, 10000)); // wait 10s

      const result = await queryVideoGeneration(taskId);
      status = result.status;

      if (status === "Preparing") console.log("...Preparing...");
      else if (status === "Queueing") console.log("...In the queue...");
      else if (status === "Processing") console.log("...Generating...");
      else if (status === "Success") {
        fileId = result.file_id;
        break;
      } else if (status === "Fail") {
        throw new Error("Video generation failed.");
      }
    }

    if (!fileId) throw new Error("Video generation timed out.");

    // Step 3: Fetch video link
    videoUrl = await fetchVideoResult(fileId);
responseString="Video Created by MinimaxAI, Check in Explore Videos Section";

}
catch(MinimaxError){
    console.error("MinimaxError error:", MinimaxError);

try{

  const input = {
    fps: 24,
    width: 1024,
    height: 576,
    prompt: enhancedPrompt,
    guidance_scale: 17.5,
    remove_watermark: true
};

let output = await replicate.run("anotherjesse/zeroscope-v2-xl:9f747673945c62801b13b84701c783929c0ee784e4748ec062204894dda1a351", { input });

 videoUrl = Array.isArray(output) && output.length > 0 ? output[0] : null;

 responseString="Video Created by Replicate, Check in Explore Videos Section";
}
catch (replicateError) {
      // Replicate failed (likely credits expired)
      console.error("Replicate error:", replicateError);


//Trying different text to Video generator AI API using stable fusion API ModelsLab

try{
console.log("Calling ModelsLab API...");
    const apiKey = process.env.MODELSLAB_API;

      const requestBody = {
        "key": apiKey,
          "model_id":"cogvideox",
        "prompt": enhancedPrompt,
         "height": 288,
  "width": 512,
  "num_frames": 25,             
  "num_inference_steps": 20,
  "guidance_scale": 7,
  "upscale_height": 288,
  "upscale_width": 512,
  "upscale_strength": 0.6,
  "upscale_guidance_scale": 12,
  "upscale_num_inference_steps": 20,
  "output_type": "mp4",
  "webhook": null,
  "track_id": null
    };

     const apiResponse = await fetch("https://modelslab.com/api/v6/video/text2video", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(requestBody)
        });
        
        const data = await apiResponse.json();
        console.log("ModelsLab API Response:", data);

     if (data.status === "processing") {
  videoUrl = data.future_links?.[0];
} else {
  videoUrl = data.output[0];
}

responseString="Video created by ModelsLab, Check in Explore Videos Section";
}

catch (ModelsLabError){
   console.error("ModelsLabError error:", ModelsLabError);

      // Fallback video URL
      videoUrl = "https://www.w3schools.com/html/mov_bbb.mp4";

       responseString="Replicate Credit Expired and ModelLabs API failed, Returned fallback video";
}
    }
  }

console.log(videoUrl);

  // Save to Database
await db.insert(videosTable).values({
  prompt: userPrompt,        // user ka original / enhanced prompt
  videoUrl:videoUrl , 
});

 
  return NextResponse.json(responseString);
    } catch (error) {
    console.error(error);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}







 