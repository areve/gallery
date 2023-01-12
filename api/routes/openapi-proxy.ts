import dotenv from 'dotenv'
import proxy from 'express-http-proxy'

const env = dotenv.config().parsed!
const apiKey = env.OPEN_AI_KEY

export const openApiProxy = proxy("api.openai.com", {
  https: true,
  limit: '10mb',
  proxyReqPathResolver: req => `/v1/${req.params[0]}`,
  proxyReqOptDecorator: opts => {
    opts.headers.Authorization = `Bearer ${apiKey}`
    return opts
  }
})
