import type { GalleryItem } from "@/interfaces/GalleryItem";
import type { GalleryItemDataUrl } from "@/interfaces/GalleryItemDataUrl";
import type { HistoryItemEdit } from "@/interfaces/HistoryItemEdit";
import type { HistoryItemGeneration } from "@/interfaces/HistoryItemGeneration";
import type { OpenAiResponse } from "@/interfaces/OpenAiResponse";
import axios from "axios";
import { clone, epochToDate, findErrorMessage } from "../views/EditorView-utils";

export async function openAiGenerateImage(item: GalleryItem, openApiKey: string) {
   const result = clone(item) as GalleryItemDataUrl

   const command = item.metadata.history[0] as HistoryItemGeneration
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
      result.metadata.history[0].error = findErrorMessage(e)
      return result
   }

   const openAiImage = (response.data as OpenAiResponse).data[0]
   result.dataUrl = `data:image/png;base64,${openAiImage.b64_json}`
   result.metadata.history[0].created = epochToDate(response.data.created).toISOString()

   return result
}

export async function openAiEditImage(item: GalleryItem, openApiKey: string) {
   const result = clone(item) as GalleryItemDataUrl


   const command = item.metadata.history[item.metadata.history.length - 1] as HistoryItemEdit

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
      result.metadata.history[0].error = findErrorMessage(e)
      return result
   }

   result.dataUrl = `data:image/png;base64,${response.data.data[0].b64_json}`
   result.metadata.history[0].created = epochToDate(response.data.created).toISOString()

   return result
}

export async function openAiImageVariation(item: GalleryItem, openApiKey: string) {

   const result = clone(item) as GalleryItemDataUrl


   const command = item.metadata.history[item.metadata.history.length - 1] as HistoryItemEdit

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
         result.metadata.history[0].error = findErrorMessage(e)
         return result   
      }
      
      result.dataUrl = `data:image/png;base64,${response.data.data[0].b64_json}`
      result.metadata.history[0].created = epochToDate(response.data.created).toISOString()
   
      return result
   
}

function getBaseUrl(openApiKey: string | null) {
   return openApiKey ? 'https://api.openai.com/v1' : '/api/openai'
}

