import type { Artwork, ArtworkError, ArtworkInMemory } from "@/interfaces/Artwork";
import type { OpenAiResponse } from "@/interfaces/OpenAiResponse";
import axios from "axios";
import { clone, epochToDate, extendMetadata, findErrorMessage } from "../lib/utils";

// TODO this is doing more than just comms with the API and it shouldn't
export async function openAiGenerateImage(command: { prompt: string }, item: Artwork, openApiKey: string) {
   const result = clone(item) as ArtworkInMemory
   result.metadata = extendMetadata(result.metadata, {
      method: 'generation',
      prompt: command.prompt,
      filename: item.filename,
      version: 'OpenAI'
   })
   let response
   try {
      response = await axios.post(
         `${getBaseUrl(openApiKey)}/images/generations`,
         {
            "prompt": command.prompt,
            "n": 1,
            "size": "1024x1024",
            "response_format": "b64_json"
         },
         {
            headers: {
               'Content-Type': 'application/json',
               Authorization: `Bearer ${openApiKey}`
            },
         })
   } catch (e) {
      result.status = 'error'
      result.metadata.history[result.metadata.history.length - 1].error = findErrorMessage(e)
      return result as any as ArtworkError
   }

   const openAiImage = (response.data as OpenAiResponse).data[0]
   result.dataUrl = `data:image/png;base64,${openAiImage.b64_json}`
   result.metadata.history[result.metadata.history.length - 1].created = epochToDate(response.data.created).toISOString()

   return result
}

export async function openAiEditImage(command: { image: Blob, mask: Blob, prompt: string }, item: Artwork, openApiKey: string) {
   const result = clone(item) as ArtworkInMemory
   result.metadata = extendMetadata(result.metadata, {
      method: 'edit',
      prompt: command.prompt,
      filename: item.filename,
      version: 'OpenAI'
   })

   const formData = new FormData();
   formData.append('image', command.image)
   formData.append('mask', command.mask)
   formData.append('prompt', command.prompt)
   formData.append('n', "1")
   formData.append('size', "1024x1024")
   formData.append('response_format', "b64_json")

   let response
   try {
      response = await axios.post(
         `${getBaseUrl(openApiKey)}/images/edits`,
         formData,
         {
            headers: {
               "Content-Type": "multipart/form-data",
               Authorization: `Bearer ${openApiKey}`
            }
         })
   } catch (e) {
      result.status = 'error'
      result.metadata.history[result.metadata.history.length - 1].error = findErrorMessage(e)
      return result
   }

   result.dataUrl = `data:image/png;base64,${response.data.data[0].b64_json}`
   result.metadata.history[result.metadata.history.length - 1].created = epochToDate(response.data.created).toISOString()

   return result
}

export async function openAiImageVariation(command: { image: Blob }, item: Artwork, openApiKey: string) {
   const result = clone(item) as ArtworkInMemory
   result.metadata = extendMetadata(result.metadata, {
      method: 'variation',
      filename: item.filename,
      version: 'OpenAI'
   })
   const formData = new FormData();
   formData.append('image', command.image)
   formData.append('n', "1")
   formData.append('size', "1024x1024")
   formData.append('response_format', "b64_json")

   let response
   try {
      response = await axios.post(
         `${getBaseUrl(openApiKey)}/images/variations`,
         formData,
         {
            headers: {
               "Content-Type": "multipart/form-data",
               Authorization: `Bearer ${openApiKey}`
            }
         })
   } catch (e) {
      result.status = 'error'
      result.metadata.history[result.metadata.history.length - 1].error = findErrorMessage(e)
      return result
   }

   result.dataUrl = `data:image/png;base64,${response.data.data[0].b64_json}`
   result.metadata.history[result.metadata.history.length - 1].created = epochToDate(response.data.created).toISOString()

   return result

}

function getBaseUrl(openApiKey: string | null) {
   return openApiKey ? 'https://api.openai.com/v1' : '/api/openai'
}

