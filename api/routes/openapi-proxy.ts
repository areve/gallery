import dotenv from 'dotenv'
import proxy from 'express-http-proxy'

const env = dotenv.config().parsed!
const apiKey = env.OPEN_AI_KEY

export const openApiProxy = proxy("api.openai.com", {
  https: true,
  proxyReqPathResolver: req => `/v1/${req.params[0]}`,
  proxyReqOptDecorator: function (proxyReqOpts, srcReq) {
    proxyReqOpts.headers.Authorization = `Bearer ${apiKey}`
    return proxyReqOpts;
  }
})
