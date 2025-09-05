
import {
  GoogleGenAI,
} from '@google/genai';
import twilio from 'twilio';
import { randomUUID } from 'crypto';
import { db } from '@/config/db';
import { eq } from "drizzle-orm";
import { WhatsAppjobsTable } from '@/config/schema';

export async function POST(req) {

  // 1. Get credentials and the Twilio client ready
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const client = twilio(accountSid, authToken);

  // 2. Extract the incoming message from Twilio
  const body = await req.formData();
  const incomingMsg = body.get('Body'); // The user's message
  const fromNumber = body.get('From'); // The user's WhatsApp number (e.g., whatsapp:+919876543210)
  
  console.log(`Message received from ${fromNumber}: "${incomingMsg}"`);

//prompt for gemini
const PROMPT=`You are an intelligent AI assistant for a WhatsApp bot named 'MakeVideo AI'. Your job is to understand the user's message and decide the correct next action.

Analyze the user's message and return a JSON object with two keys: "intent" and "response_text".

Classify the user's "intent" into one of these EXACT categories:
- "generate_video": The user provides a clear, descriptive prompt for a video.
- "clarify_prompt": The user's prompt is too short or vague (e.g., "a cat", "a car").
- "request_without_prompt": The user asks to make a video but gives NO description (e.g., "make a video", "generate something").
- "greeting": The user says a simple greeting like "hi", "hello".
- "small_talk": The user is just chatting or asking a general question about you.

Based on the intent, create the "response_text":
- For "clarify_prompt", make it an enhanced, descriptive prompt suggestion.
- For all other intents, make it a friendly, conversational reply. For "greeting", introduce yourself. For "request_without_prompt", ask for a description.

Do NOT include any text outside of the single JSON object.

Here is the user's message:`


// user message ko gemini se pass karna 
const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
  });

    try{
  const config = {
    responseMimeType: 'text/plain',
  };
  const model = 'gemini-2.0-flash';
  const contents = [
    {
      role: 'user',
      parts: [
        {
          text: PROMPT + JSON.stringify(incomingMsg),
        },
      ],
    },
  ];

  const response = await ai.models.generateContent({
    model,
    config,
    contents,
  });
 

const RawResp = response.candidates[0].content.parts[0].text;
const RawJson = RawResp.replace('```json','').replace('```', '');
const JSONResp = JSON.parse(RawJson);

// Extract intent and response_text fields
  const intent = JSONResp.intent;
  const ResponseForUser = JSONResp.response_text;

  switch (intent) {
  case "generate_video":
    // The prompt is good! Start the video generation.
    await sendTwilioMessage(client,fromNumber, `✅ Got it! Starting video for: "${ResponseForUser}"`);
    generateVideoInBackground(client, fromNumber,incomingMsg,ResponseForUser);
    break;

  case "clarify_prompt":
    // The prompt is too short. Send the suggestion with interactive buttons.
    await sendTwilioInteractiveMessage(client,fromNumber, `🤔 Your prompt is a bit short. How about this instead: "${ResponseForUser}"`);
    break;
    
  case "greeting":
    // The user said hi. Greet them back and tell them what you do.
    await sendTwilioMessage(client,fromNumber, "Hello! I'm MakeVideo AI. You can describe any video you'd like me to create.");
    break;

  case "request_without_prompt":
    // The user asked to make a video but didn't say what.
    await sendTwilioMessage(client,fromNumber, "I'd love to! Please describe the video you want me to generate.");
    break;

  case "small_talk":
    // It's just a chat message. Reply conversationally.
    await sendTwilioMessage(client,fromNumber, ResponseForUser);
    break;

  default:
    // Fallback for any unknown intent
    await sendTwilioMessage(client,fromNumber, "Sorry, I didn't understand. To create a video, please send me a description.");
}



}
catch (geminiError){
    console.error("Gemini error:", geminiError);
}


     
  // 4. Send an empty response to Twilio to acknowledge receipt
  return new Response('<Response></Response>', { 
    headers: { 'Content-Type': 'text/xml' } 
  });
}




// Helper function to send WhatsApp messages via Twilio
async function sendTwilioMessage(client,toNumber, message, mediaUrls = []) {

  try {
    const messageOptions = {
      body: message,
      from: 'whatsapp:+14155238886', 
      to: toNumber
    };
    
    // Add media if provided
    if (mediaUrls.length > 0) {
      messageOptions.mediaUrl = mediaUrls;
    }
    
    // Send the message
    // const result = await client.messages.create(messageOptions);
    // console.log(`Message sent successfully. SID: ${result.sid}`);
    console.log(`Message sent successfully for testing. ${messageOptions?.body} and ${messageOptions.mediaUrl}`);
  
  } catch (error) {
    console.error("Failed to send Twilio message:", error);
  }
}


async function generateVideoInBackground(client, fromNumber, incomingMsg, ResponseForUser) {
   
    // Step 1: Generate a unique Job ID using UUID
    const jobId = randomUUID();

    // Step 2: Prepare the data to be saved in the database
    const newJob = {
        id: jobId,
        userPhone: fromNumber,
        userPrompt: incomingMsg,
        enhancedPrompt: ResponseForUser,
        status: "processing", // Set initial status to processing
    };

    console.log(`Job created with ID: ${jobId}`);

    // Step 3: Insert the new job record into the database
   await db.insert(WhatsAppjobsTable).values(newJob).catch(error => {
        console.error("Failed to insert job into database:", error);
    });

const confirmationMessage = `✅ Your request has been received! I've started working on your request.\n\n*Your Job ID is:* ${jobId}\n\nYou can check the progress at any time by sending:\n/status ${jobId}`;
await sendTwilioMessage(client,fromNumber, confirmationMessage);

    
    // Step 4: Call the existing video generation API endpoint
try {
    const baseUrl = process.env.BASE_URL || 'http://localhost:3000';
    const response = await fetch(`${baseUrl}/api/generate-video`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
            formPrompt: ResponseForUser,
            jobId: jobId,
            source: 'whatsapp'
        })
    });

    const result = await response.json();
    
    if (result.success) {
        // Update job status
        await db.update(WhatsAppjobsTable)
            .set({ 
                status: "completed", 
                videoUrl: result.videoUrl || null 
            })
            .where(eq(WhatsAppjobsTable.id, jobId))
            .catch(error => {
                console.error("Failed to update job status:", error);
            });
        
        // Send the video to the user
        await sendTwilioMessage(
            client, 
            fromNumber, 
            "✨ Your video is ready! Here it is:",
            [result.videoUrl || "https://pub-3626123a908346a7a8be8d9295f44e26.r2.dev/video_generations/b6716f42-3518-4105-8f55-500fda5f99a8.mp4"]
        );
  await sendTwilioMessage(
            client, 
            fromNumber, 
         `✅ All done! Here's the video you asked for. ✨\n\nIf you need to reference it later, your Job ID is: ${jobId}`
           );
         
    } else {
        // Something went wrong
        await sendTwilioMessage(
            client, 
            fromNumber, 
            "Sorry, there was an issue generating your video. Please try again."
        );
    }
} catch (error) {
    console.error("Error calling video generation API:", error);
    await sendTwilioMessage(
        client, 
        fromNumber, 
        "Sorry, there was an error processing your request."
    );
}

}