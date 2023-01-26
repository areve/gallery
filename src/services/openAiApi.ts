import type { Artwork, ArtworkError, ArtworkInMemory } from "@/interfaces/Artwork";
import type { ImageResult, ImageResultError, ImageResultReady, OpenAiResponse } from "@/interfaces/OpenAiResponse";
import axios from "axios";
import { clone, epochToDate, extendMetadata, findErrorMessage, last } from "../lib/utils";

export async function openAiGenerateImage(command: { prompt: string }, openApiKey: string): Promise<ImageResult> {
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
      return <ImageResultError>{
         status: 'error',
         error: findErrorMessage(e)
      }
   }

   const openAiImage = (response.data as OpenAiResponse).data[0]
   return <ImageResultReady>{
      status: 'ready',
      created: epochToDate(response.data.created),
      dataUrl: `data:image/png;base64,${openAiImage.b64_json}`
   }
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
      last(result.metadata.history).error = findErrorMessage(e)
      return result
   }

   result.dataUrl = `data:image/png;base64,${response.data.data[0].b64_json}`
   last(result.metadata.history).created = epochToDate(response.data.created).toISOString()

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
      last(result.metadata.history).error = findErrorMessage(e)
      return result
   }

   result.dataUrl = `data:image/png;base64,${response.data.data[0].b64_json}`
   last(result.metadata.history).created = epochToDate(response.data.created).toISOString()

   return result

}

function getBaseUrl(openApiKey: string | null) {
   return openApiKey ? 'https://api.openai.com/v1' : '/api/openai'
}

