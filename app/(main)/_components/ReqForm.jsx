"use client"
import React, { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import { Sparkle, Loader2Icon } from "lucide-react"
import axios from "axios"

export default function ReqForm() {
  const [loading, setLoading] = useState(false);
      const [formPrompt, setFormPrompt] = useState('');

  const onHandleInputChange = (value) => {
    setFormPrompt(value);
    console.log(formPrompt);
  };


  const onGenerate = async () => {
    console.log(formPrompt);
    
    try{
    setLoading(true);
    let result;
     if(formPrompt===""){
  result = await axios.post('/api/generate-video', {
     formPrompt:"Clown fish swimming in a coral reef, beautiful, 8k, perfect, award winning, national geographic" 
    });
        }
        else{
    result = await axios.post('/api/generate-video', {
     formPrompt:formPrompt 
    });
}
    setLoading(false);
    // console.log("Done")
    toast.success(result.data || "Video Created!");
  }
  catch (e){
    setLoading(false);
    console.log(e);
    toast.error('Video generation failed, Try Again!');
  }
  }


  return (
    <div className="grid w-full gap-2">
      <Textarea placeholder="Type your video prompt here. (e.g. Clown fish swimming in a coral reef, beautiful, 8k, perfect, award winning, national geographic)"
       className="w-full border rounded p-2"
                  onChange={event => onHandleInputChange(event?.target.value)} />
        <Button className="w-full mt-5" onClick={onGenerate} disabled={loading}>
                  {loading ? <Loader2Icon className="animate-spin" /> : <Sparkle />} Generate Video
                </Button>
    </div>
  )
}
