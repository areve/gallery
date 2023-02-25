import type { ImageResult, ImageResultError, ImageResultReady, OpenAiResponse } from "@/interfaces/OpenAiResponse";
import axios, { type AxiosRequestConfig, type AxiosResponse } from "axios";
import { epochToDate, findErrorMessage } from "../../lib/utils";
import { loginState } from "../EditorApp/loginState";

export async function openAiGenerateImage(command: { prompt: string }, openApiKey: string): Promise<ImageResult> {
  console.log("loginState.value", loginState.value);
  return await tryPost(
    `${getBaseUrl(openApiKey)}/images/generations`,
    {
      prompt: command.prompt,
      n: 1,
      size: "1024x1024",
      response_format: "b64_json",
    },
    {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${openApiKey || loginState.value.token}`,
      },
    }
  );
}

export async function openAiEditImage(command: { image: Blob; mask: Blob; prompt: string }, openApiKey: string) {
  return await tryPost(
    `${getBaseUrl(openApiKey)}/images/edits`,
    formData({
      image: command.image,
      mask: command.mask,
      prompt: command.prompt,
      n: "1",
      size: "1024x1024",
      response_format: "b64_json",
    }),
    {
      headers: {
        "Content-Type": "multipart/form-data",
        Authorization: `Bearer ${openApiKey || loginState.value.token}`,
      },
    }
  );
}

export async function openAiImageVariation(command: { image: Blob }, openApiKey: string) {
  return await tryPost(
    `${getBaseUrl(openApiKey)}/images/variations`,
    formData({
      image: command.image,
      n: "1",
      size: "1024x1024",
      response_format: "b64_json",
    }),
    {
      headers: {
        "Content-Type": "multipart/form-data",
        Authorization: `Bearer ${openApiKey || loginState.value.token}`,
      },
    }
  );
}

async function tryPost(url: string, data: any, config: AxiosRequestConfig<any>) {
  let response: AxiosResponse<OpenAiResponse>;
  try {
    response = await axios.post(url, data, config);
  } catch (e) {
    return <ImageResultError>{
      status: "error",
      error: findErrorMessage(e),
    };
  }

  const openAiImage = response.data.data[0];
  return <ImageResultReady>{
    status: "ready",
    created: epochToDate(response.data.created),
    dataUrl: `data:image/png;base64,${openAiImage.b64_json}`,
  };
}

function getBaseUrl(openApiKey: string | null) {
  //return openApiKey ? "https://api.openai.com/v1" : "/openai";
  return openApiKey ? "https://api.openai.com/v1" : "https://us-central1-gallery-challen-info.cloudfunctions.net/gallery-api/openai";
  //return openApiKey ? "https://api.openai.com/v1" : "http://localhost:8080/openai";
}

function formData(value: { [key: string]: string | Blob }) {
  const result = new FormData();
  Object.keys(value).forEach((key) => {
    result.append(key, value[key]);
  });
  return result;
}
