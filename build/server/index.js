import { jsxs, Fragment, jsx } from 'react/jsx-runtime';
import { Meta, Links, Outlet, ScrollRestoration, Scripts, RemixServer } from '@remix-run/react';
import { isbot } from 'isbot';
import pkg from 'react-dom/server';
const { renderToReadableStream } = pkg;
// import { renderToReadableStream } from 'react-dom/server';
import { createHead, renderHeadToString } from 'remix-island';
import { useStore } from '@nanostores/react';
import { atom, map } from 'nanostores';
import React, { useEffect, memo, useState } from 'react';
import process from 'vite-plugin-node-polyfills/shims/process';
import { json } from '@remix-run/cloudflare';
import { streamText as streamText$1, convertToCoreMessages, parseStreamPart, StreamingTextResponse } from 'ai';
import { env } from 'node:process';
import { createAnthropic } from '@ai-sdk/anthropic';
import { createOpenAI } from '@ai-sdk/openai';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { ollama } from 'ollama-ai-provider';
import { createOpenRouter } from '@openrouter/ai-sdk-provider';
import { createMistral } from '@ai-sdk/mistral';
import { createCohere } from '@ai-sdk/cohere';
import { defaultSchema } from 'rehype-sanitize';
import { ClientOnly } from 'remix-utils/client-only';
import Cookies from 'js-cookie';
import * as Tooltip from '@radix-ui/react-tooltip';
import { toast } from 'react-toastify';
import ignore from 'ignore';

const tailwindReset = '/assets/tailwind-compat-Bwh-BmjE.css';

const DEFAULT_THEME = 'light';
const themeStore = atom(initStore());
function initStore() {
  return DEFAULT_THEME;
}

function stripIndents(arg0, ...values) {
  if (typeof arg0 !== 'string') {
    const processedString = arg0.reduce((acc, curr, i) => {
      acc += curr + (values[i] ?? '');
      return acc;
    }, '');
    return _stripIndents(processedString);
  }
  return _stripIndents(arg0);
}
function _stripIndents(value) {
  return value
    .split('\n')
    .map((line) => line.trim())
    .join('\n')
    .trimStart()
    .replace(/[\r\n]$/, '');
}

const reactToastifyStyles = '/assets/ReactToastify-Bh76j7cs.css';

const globalStyles = '/assets/index-B_SmrGLj.css';

const xtermStyles = '/assets/xterm-LZoznX6r.css';

const links = () => [
  {
    rel: 'icon',
    href: '/favicon.svg',
    type: 'image/svg+xml',
  },
  { rel: 'stylesheet', href: reactToastifyStyles },
  { rel: 'stylesheet', href: tailwindReset },
  { rel: 'stylesheet', href: globalStyles },
  { rel: 'stylesheet', href: xtermStyles },
  {
    rel: 'preconnect',
    href: 'https://fonts.googleapis.com',
  },
  {
    rel: 'preconnect',
    href: 'https://fonts.gstatic.com',
    crossOrigin: 'anonymous',
  },
  {
    rel: 'stylesheet',
    href: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap',
  },
];
const inlineThemeCode = stripIndents`
  setTutorialKitTheme();

  function setTutorialKitTheme() {
    let theme = localStorage.getItem('bolt_theme');

    if (!theme) {
      theme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }

    document.querySelector('html')?.setAttribute('data-theme', theme);
  }
`;
const Head = createHead(() =>
  /* @__PURE__ */ jsxs(Fragment, {
    children: [
      /* @__PURE__ */ jsx('meta', { charSet: 'utf-8' }),
      /* @__PURE__ */ jsx('meta', { name: 'viewport', content: 'width=device-width, initial-scale=1' }),
      /* @__PURE__ */ jsx(Meta, {}),
      /* @__PURE__ */ jsx(Links, {}),
      /* @__PURE__ */ jsx('script', { dangerouslySetInnerHTML: { __html: inlineThemeCode } }),
    ],
  }),
);
function Layout({ children }) {
  const theme = useStore(themeStore);
  useEffect(() => {
    document.querySelector('html')?.setAttribute('data-theme', theme);
  }, [theme]);
  return /* @__PURE__ */ jsxs(Fragment, {
    children: [children, /* @__PURE__ */ jsx(ScrollRestoration, {}), /* @__PURE__ */ jsx(Scripts, {})],
  });
}
function App() {
  return /* @__PURE__ */ jsx(Outlet, {});
}

const route0 = /*#__PURE__*/ Object.freeze(
  /*#__PURE__*/ Object.defineProperty(
    {
      __proto__: null,
      Head,
      Layout,
      default: App,
      links,
    },
    Symbol.toStringTag,
    { value: 'Module' },
  ),
);

const WORK_DIR_NAME = 'project';
const WORK_DIR = `/home/${WORK_DIR_NAME}`;
const MODIFICATIONS_TAG_NAME = 'bolt_file_modifications';
const MODEL_REGEX = /^\[Model: (.*?)\]\n\n/;
const PROVIDER_REGEX = /\[Provider: (.*?)\]\n\n/;
const DEFAULT_MODEL = 'claude-3-5-sonnet-latest';
const PROVIDER_LIST = [
  {
    name: 'Anthropic',
    staticModels: [
      {
        name: 'claude-3-5-sonnet-latest',
        label: 'Claude 3.5 Sonnet (new)',
        provider: 'Anthropic',
        maxTokenAllowed: 8e3,
      },
      {
        name: 'claude-3-5-sonnet-20240620',
        label: 'Claude 3.5 Sonnet (old)',
        provider: 'Anthropic',
        maxTokenAllowed: 8e3,
      },
      {
        name: 'claude-3-5-haiku-latest',
        label: 'Claude 3.5 Haiku (new)',
        provider: 'Anthropic',
        maxTokenAllowed: 8e3,
      },
      { name: 'claude-3-opus-latest', label: 'Claude 3 Opus', provider: 'Anthropic', maxTokenAllowed: 8e3 },
      { name: 'claude-3-sonnet-20240229', label: 'Claude 3 Sonnet', provider: 'Anthropic', maxTokenAllowed: 8e3 },
      { name: 'claude-3-haiku-20240307', label: 'Claude 3 Haiku', provider: 'Anthropic', maxTokenAllowed: 8e3 },
    ],
    getApiKeyLink: 'https://console.anthropic.com/settings/keys',
  },
  {
    name: 'Ollama',
    staticModels: [],
    getDynamicModels: getOllamaModels,
    getApiKeyLink: 'https://ollama.com/download',
    labelForGetApiKey: 'Download Ollama',
    icon: 'i-ph:cloud-arrow-down',
  },
  {
    name: 'OpenAILike',
    staticModels: [],
    getDynamicModels: getOpenAILikeModels,
  },
  {
    name: 'Cohere',
    staticModels: [
      { name: 'command-r-plus-08-2024', label: 'Command R plus Latest', provider: 'Cohere', maxTokenAllowed: 4096 },
      { name: 'command-r-08-2024', label: 'Command R Latest', provider: 'Cohere', maxTokenAllowed: 4096 },
      { name: 'command-r-plus', label: 'Command R plus', provider: 'Cohere', maxTokenAllowed: 4096 },
      { name: 'command-r', label: 'Command R', provider: 'Cohere', maxTokenAllowed: 4096 },
      { name: 'command', label: 'Command', provider: 'Cohere', maxTokenAllowed: 4096 },
      { name: 'command-nightly', label: 'Command Nightly', provider: 'Cohere', maxTokenAllowed: 4096 },
      { name: 'command-light', label: 'Command Light', provider: 'Cohere', maxTokenAllowed: 4096 },
      { name: 'command-light-nightly', label: 'Command Light Nightly', provider: 'Cohere', maxTokenAllowed: 4096 },
      { name: 'c4ai-aya-expanse-8b', label: 'c4AI Aya Expanse 8b', provider: 'Cohere', maxTokenAllowed: 4096 },
      { name: 'c4ai-aya-expanse-32b', label: 'c4AI Aya Expanse 32b', provider: 'Cohere', maxTokenAllowed: 4096 },
    ],
    getApiKeyLink: 'https://dashboard.cohere.com/api-keys',
  },
  {
    name: 'OpenRouter',
    staticModels: [
      { name: 'gpt-4o', label: 'GPT-4o', provider: 'OpenAI', maxTokenAllowed: 8e3 },
      {
        name: 'anthropic/claude-3.5-sonnet',
        label: 'Anthropic: Claude 3.5 Sonnet (OpenRouter)',
        provider: 'OpenRouter',
        maxTokenAllowed: 8e3,
      },
      {
        name: 'anthropic/claude-3-haiku',
        label: 'Anthropic: Claude 3 Haiku (OpenRouter)',
        provider: 'OpenRouter',
        maxTokenAllowed: 8e3,
      },
      {
        name: 'deepseek/deepseek-coder',
        label: 'Deepseek-Coder V2 236B (OpenRouter)',
        provider: 'OpenRouter',
        maxTokenAllowed: 8e3,
      },
      {
        name: 'google/gemini-flash-1.5',
        label: 'Google Gemini Flash 1.5 (OpenRouter)',
        provider: 'OpenRouter',
        maxTokenAllowed: 8e3,
      },
      {
        name: 'google/gemini-pro-1.5',
        label: 'Google Gemini Pro 1.5 (OpenRouter)',
        provider: 'OpenRouter',
        maxTokenAllowed: 8e3,
      },
      { name: 'x-ai/grok-beta', label: 'xAI Grok Beta (OpenRouter)', provider: 'OpenRouter', maxTokenAllowed: 8e3 },
      {
        name: 'mistralai/mistral-nemo',
        label: 'OpenRouter Mistral Nemo (OpenRouter)',
        provider: 'OpenRouter',
        maxTokenAllowed: 8e3,
      },
      {
        name: 'qwen/qwen-110b-chat',
        label: 'OpenRouter Qwen 110b Chat (OpenRouter)',
        provider: 'OpenRouter',
        maxTokenAllowed: 8e3,
      },
      { name: 'cohere/command', label: 'Cohere Command (OpenRouter)', provider: 'OpenRouter', maxTokenAllowed: 4096 },
    ],
    getDynamicModels: getOpenRouterModels,
    getApiKeyLink: 'https://openrouter.ai/settings/keys',
  },
  {
    name: 'Google',
    staticModels: [
      { name: 'gemini-1.5-flash-latest', label: 'Gemini 1.5 Flash', provider: 'Google', maxTokenAllowed: 8192 },
      { name: 'gemini-1.5-flash-002', label: 'Gemini 1.5 Flash-002', provider: 'Google', maxTokenAllowed: 8192 },
      { name: 'gemini-1.5-flash-8b', label: 'Gemini 1.5 Flash-8b', provider: 'Google', maxTokenAllowed: 8192 },
      { name: 'gemini-1.5-pro-latest', label: 'Gemini 1.5 Pro', provider: 'Google', maxTokenAllowed: 8192 },
      { name: 'gemini-1.5-pro-002', label: 'Gemini 1.5 Pro-002', provider: 'Google', maxTokenAllowed: 8192 },
      { name: 'gemini-exp-1121', label: 'Gemini exp-1121', provider: 'Google', maxTokenAllowed: 8192 },
      { name: 'gemini-exp-1206', label: 'Gemini exp-1206', provider: 'Google', maxTokenAllowed: 8192 },
    ],
    getApiKeyLink: 'https://aistudio.google.com/app/apikey',
  },
  {
    name: 'Groq',
    staticModels: [
      { name: 'llama-3.1-70b-versatile', label: 'Llama 3.1 70b (Groq)', provider: 'Groq', maxTokenAllowed: 8e3 },
      { name: 'llama-3.1-8b-instant', label: 'Llama 3.1 8b (Groq)', provider: 'Groq', maxTokenAllowed: 8e3 },
      { name: 'llama-3.2-11b-vision-preview', label: 'Llama 3.2 11b (Groq)', provider: 'Groq', maxTokenAllowed: 8e3 },
      { name: 'llama-3.2-3b-preview', label: 'Llama 3.2 3b (Groq)', provider: 'Groq', maxTokenAllowed: 8e3 },
      { name: 'llama-3.2-1b-preview', label: 'Llama 3.2 1b (Groq)', provider: 'Groq', maxTokenAllowed: 8e3 },
    ],
    getApiKeyLink: 'https://console.groq.com/keys',
  },
  {
    name: 'HuggingFace',
    staticModels: [
      {
        name: 'Qwen/Qwen2.5-Coder-32B-Instruct',
        label: 'Qwen2.5-Coder-32B-Instruct (HuggingFace)',
        provider: 'HuggingFace',
        maxTokenAllowed: 8e3,
      },
      {
        name: '01-ai/Yi-1.5-34B-Chat',
        label: 'Yi-1.5-34B-Chat (HuggingFace)',
        provider: 'HuggingFace',
        maxTokenAllowed: 8e3,
      },
      {
        name: 'codellama/CodeLlama-34b-Instruct-hf',
        label: 'CodeLlama-34b-Instruct (HuggingFace)',
        provider: 'HuggingFace',
        maxTokenAllowed: 8e3,
      },
      {
        name: 'NousResearch/Hermes-3-Llama-3.1-8B',
        label: 'Hermes-3-Llama-3.1-8B (HuggingFace)',
        provider: 'HuggingFace',
        maxTokenAllowed: 8e3,
      },
      {
        name: 'Qwen/Qwen2.5-Coder-32B-Instruct',
        label: 'Qwen2.5-Coder-32B-Instruct (HuggingFace)',
        provider: 'HuggingFace',
        maxTokenAllowed: 8e3,
      },
      {
        name: 'Qwen/Qwen2.5-72B-Instruct',
        label: 'Qwen2.5-72B-Instruct (HuggingFace)',
        provider: 'HuggingFace',
        maxTokenAllowed: 8e3,
      },
      {
        name: 'meta-llama/Llama-3.1-70B-Instruct',
        label: 'Llama-3.1-70B-Instruct (HuggingFace)',
        provider: 'HuggingFace',
        maxTokenAllowed: 8e3,
      },
      {
        name: 'meta-llama/Llama-3.1-405B',
        label: 'Llama-3.1-405B (HuggingFace)',
        provider: 'HuggingFace',
        maxTokenAllowed: 8e3,
      },
      {
        name: '01-ai/Yi-1.5-34B-Chat',
        label: 'Yi-1.5-34B-Chat (HuggingFace)',
        provider: 'HuggingFace',
        maxTokenAllowed: 8e3,
      },
      {
        name: 'codellama/CodeLlama-34b-Instruct-hf',
        label: 'CodeLlama-34b-Instruct (HuggingFace)',
        provider: 'HuggingFace',
        maxTokenAllowed: 8e3,
      },
      {
        name: 'NousResearch/Hermes-3-Llama-3.1-8B',
        label: 'Hermes-3-Llama-3.1-8B (HuggingFace)',
        provider: 'HuggingFace',
        maxTokenAllowed: 8e3,
      },
    ],
    getApiKeyLink: 'https://huggingface.co/settings/tokens',
  },
  {
    name: 'OpenAI',
    staticModels: [
      { name: 'gpt-4o-mini', label: 'GPT-4o Mini', provider: 'OpenAI', maxTokenAllowed: 8e3 },
      { name: 'gpt-4-turbo', label: 'GPT-4 Turbo', provider: 'OpenAI', maxTokenAllowed: 8e3 },
      { name: 'gpt-4', label: 'GPT-4', provider: 'OpenAI', maxTokenAllowed: 8e3 },
      { name: 'gpt-3.5-turbo', label: 'GPT-3.5 Turbo', provider: 'OpenAI', maxTokenAllowed: 8e3 },
    ],
    getApiKeyLink: 'https://platform.openai.com/api-keys',
  },
  {
    name: 'xAI',
    staticModels: [{ name: 'grok-beta', label: 'xAI Grok Beta', provider: 'xAI', maxTokenAllowed: 8e3 }],
    getApiKeyLink: 'https://docs.x.ai/docs/quickstart#creating-an-api-key',
  },
  {
    name: 'Deepseek',
    staticModels: [
      { name: 'deepseek-coder', label: 'Deepseek-Coder', provider: 'Deepseek', maxTokenAllowed: 8e3 },
      { name: 'deepseek-chat', label: 'Deepseek-Chat', provider: 'Deepseek', maxTokenAllowed: 8e3 },
    ],
    getApiKeyLink: 'https://platform.deepseek.com/apiKeys',
  },
  {
    name: 'Mistral',
    staticModels: [
      { name: 'open-mistral-7b', label: 'Mistral 7B', provider: 'Mistral', maxTokenAllowed: 8e3 },
      { name: 'open-mixtral-8x7b', label: 'Mistral 8x7B', provider: 'Mistral', maxTokenAllowed: 8e3 },
      { name: 'open-mixtral-8x22b', label: 'Mistral 8x22B', provider: 'Mistral', maxTokenAllowed: 8e3 },
      { name: 'open-codestral-mamba', label: 'Codestral Mamba', provider: 'Mistral', maxTokenAllowed: 8e3 },
      { name: 'open-mistral-nemo', label: 'Mistral Nemo', provider: 'Mistral', maxTokenAllowed: 8e3 },
      { name: 'ministral-8b-latest', label: 'Mistral 8B', provider: 'Mistral', maxTokenAllowed: 8e3 },
      { name: 'mistral-small-latest', label: 'Mistral Small', provider: 'Mistral', maxTokenAllowed: 8e3 },
      { name: 'codestral-latest', label: 'Codestral', provider: 'Mistral', maxTokenAllowed: 8e3 },
      { name: 'mistral-large-latest', label: 'Mistral Large Latest', provider: 'Mistral', maxTokenAllowed: 8e3 },
    ],
    getApiKeyLink: 'https://console.mistral.ai/api-keys/',
  },
  {
    name: 'LMStudio',
    staticModels: [],
    getDynamicModels: getLMStudioModels,
    getApiKeyLink: 'https://lmstudio.ai/',
    labelForGetApiKey: 'Get LMStudio',
    icon: 'i-ph:cloud-arrow-down',
  },
  {
    name: 'Together',
    staticModels: [
      {
        name: 'Qwen/Qwen2.5-Coder-32B-Instruct',
        label: 'Qwen/Qwen2.5-Coder-32B-Instruct',
        provider: 'Together',
        maxTokenAllowed: 8e3,
      },
      {
        name: 'meta-llama/Llama-3.2-90B-Vision-Instruct-Turbo',
        label: 'meta-llama/Llama-3.2-90B-Vision-Instruct-Turbo',
        provider: 'Together',
        maxTokenAllowed: 8e3,
      },
      {
        name: 'mistralai/Mixtral-8x7B-Instruct-v0.1',
        label: 'Mixtral 8x7B Instruct',
        provider: 'Together',
        maxTokenAllowed: 8192,
      },
    ],
    getApiKeyLink: 'https://api.together.xyz/settings/api-keys',
  },
];
const DEFAULT_PROVIDER = PROVIDER_LIST[0];
const staticModels = PROVIDER_LIST.map((p) => p.staticModels).flat();
let MODEL_LIST = [...staticModels];
const getOllamaBaseUrl = () => {
  const defaultBaseUrl = 'http://localhost:11434';
  if (typeof window !== 'undefined') {
    return defaultBaseUrl;
  }
  const isDocker = process.env.RUNNING_IN_DOCKER === 'true';
  return isDocker ? defaultBaseUrl.replace('localhost', 'host.docker.internal') : defaultBaseUrl;
};
async function getOllamaModels() {
  try {
    const baseUrl = getOllamaBaseUrl();
    const response = await fetch(`${baseUrl}/api/tags`);
    const data = await response.json();
    return data.models.map((model) => ({
      name: model.name,
      label: `${model.name} (${model.details.parameter_size})`,
      provider: 'Ollama',
      maxTokenAllowed: 8e3,
    }));
  } catch (e) {
    console.error('Error getting Ollama models:', e);
    return [];
  }
}
async function getOpenAILikeModels() {
  try {
    const baseUrl = undefined || '';
    if (!baseUrl) {
      return [];
    }
    const apiKey = undefined ?? '';
    const response = await fetch(`${baseUrl}/models`, {
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
    });
    const res = await response.json();
    return res.data.map((model) => ({
      name: model.id,
      label: model.id,
      provider: 'OpenAILike',
    }));
  } catch (e) {
    console.error('Error getting OpenAILike models:', e);
    return [];
  }
}
async function getOpenRouterModels() {
  const data = await (
    await fetch('https://openrouter.ai/api/v1/models', {
      headers: {
        'Content-Type': 'application/json',
      },
    })
  ).json();
  return data.data
    .sort((a, b) => a.name.localeCompare(b.name))
    .map((m) => ({
      name: m.id,
      label: `${m.name} - in:$${(m.pricing.prompt * 1e6).toFixed(
        2,
      )} out:$${(m.pricing.completion * 1e6).toFixed(2)} - context ${Math.floor(m.context_length / 1e3)}k`,
      provider: 'OpenRouter',
      maxTokenAllowed: 8e3,
    }));
}
async function getLMStudioModels() {
  if (typeof window === 'undefined') {
    return [];
  }
  try {
    const baseUrl = undefined || 'http://localhost:1234';
    const response = await fetch(`${baseUrl}/v1/models`);
    const data = await response.json();
    return data.data.map((model) => ({
      name: model.id,
      label: model.id,
      provider: 'LMStudio',
    }));
  } catch (e) {
    console.error('Error getting LMStudio models:', e);
    return [];
  }
}
async function initializeModelList() {
  MODEL_LIST = [
    ...(await Promise.all(PROVIDER_LIST.filter((p) => !!p.getDynamicModels).map((p) => p.getDynamicModels()))).flat(),
    ...staticModels,
  ];
  return MODEL_LIST;
}

async function handleRequest(request, responseStatusCode, responseHeaders, remixContext, _loadContext) {
  await initializeModelList();
  const readable = await renderToReadableStream(
    /* @__PURE__ */ jsx(RemixServer, { context: remixContext, url: request.url }),
    {
      signal: request.signal,
      onError(error) {
        console.error(error);
        responseStatusCode = 500;
      },
    },
  );
  const body = new ReadableStream({
    start(controller) {
      const head = renderHeadToString({ request, remixContext, Head });
      controller.enqueue(
        new Uint8Array(
          new TextEncoder().encode(
            `<!DOCTYPE html><html lang="en" data-theme="${themeStore.value}"><head>${head}</head><body><div id="root" class="w-full h-full">`,
          ),
        ),
      );
      const reader = readable.getReader();
      function read() {
        reader
          .read()
          .then(({ done, value }) => {
            if (done) {
              controller.enqueue(new Uint8Array(new TextEncoder().encode('</div></body></html>')));
              controller.close();
              return;
            }
            controller.enqueue(value);
            read();
          })
          .catch((error) => {
            controller.error(error);
            readable.cancel();
          });
      }
      read();
    },
    cancel() {
      readable.cancel();
    },
  });
  if (isbot(request.headers.get('user-agent') || '')) {
    await readable.allReady;
  }
  responseHeaders.set('Content-Type', 'text/html');
  responseHeaders.set('Cross-Origin-Embedder-Policy', 'require-corp');
  responseHeaders.set('Cross-Origin-Opener-Policy', 'same-origin');
  return new Response(body, {
    headers: responseHeaders,
    status: responseStatusCode,
  });
}

const entryServer = /*#__PURE__*/ Object.freeze(
  /*#__PURE__*/ Object.defineProperty(
    {
      __proto__: null,
      default: handleRequest,
    },
    Symbol.toStringTag,
    { value: 'Module' },
  ),
);

function getAPIKey(cloudflareEnv, provider, userApiKeys) {
  if (userApiKeys?.[provider]) {
    return userApiKeys[provider];
  }
  switch (provider) {
    case 'Anthropic':
      return env.ANTHROPIC_API_KEY || cloudflareEnv.ANTHROPIC_API_KEY;
    case 'OpenAI':
      return env.OPENAI_API_KEY || cloudflareEnv.OPENAI_API_KEY;
    case 'Google':
      return env.GOOGLE_GENERATIVE_AI_API_KEY || cloudflareEnv.GOOGLE_GENERATIVE_AI_API_KEY;
    case 'Groq':
      return env.GROQ_API_KEY || cloudflareEnv.GROQ_API_KEY;
    case 'HuggingFace':
      return env.HuggingFace_API_KEY || cloudflareEnv.HuggingFace_API_KEY;
    case 'OpenRouter':
      return env.OPEN_ROUTER_API_KEY || cloudflareEnv.OPEN_ROUTER_API_KEY;
    case 'Deepseek':
      return env.DEEPSEEK_API_KEY || cloudflareEnv.DEEPSEEK_API_KEY;
    case 'Mistral':
      return env.MISTRAL_API_KEY || cloudflareEnv.MISTRAL_API_KEY;
    case 'OpenAILike':
      return env.OPENAI_LIKE_API_KEY || cloudflareEnv.OPENAI_LIKE_API_KEY;
    case 'Together':
      return env.TOGETHER_API_KEY || cloudflareEnv.TOGETHER_API_KEY;
    case 'xAI':
      return env.XAI_API_KEY || cloudflareEnv.XAI_API_KEY;
    case 'Cohere':
      return env.COHERE_API_KEY;
    case 'AzureOpenAI':
      return env.AZURE_OPENAI_API_KEY;
    default:
      return '';
  }
}
function getBaseURL(cloudflareEnv, provider) {
  switch (provider) {
    case 'Together':
      return env.TOGETHER_API_BASE_URL || cloudflareEnv.TOGETHER_API_BASE_URL;
    case 'OpenAILike':
      return env.OPENAI_LIKE_API_BASE_URL || cloudflareEnv.OPENAI_LIKE_API_BASE_URL;
    case 'LMStudio':
      return env.LMSTUDIO_API_BASE_URL || cloudflareEnv.LMSTUDIO_API_BASE_URL || 'http://localhost:1234';
    case 'Ollama': {
      let baseUrl = env.OLLAMA_API_BASE_URL || cloudflareEnv.OLLAMA_API_BASE_URL || 'http://localhost:11434';
      if (env.RUNNING_IN_DOCKER === 'true') {
        baseUrl = baseUrl.replace('localhost', 'host.docker.internal');
      }
      return baseUrl;
    }
    default:
      return '';
  }
}

const DEFAULT_NUM_CTX = process.env.DEFAULT_NUM_CTX ? parseInt(process.env.DEFAULT_NUM_CTX, 10) : 32768;
function getAnthropicModel(apiKey, model) {
  const anthropic = createAnthropic({
    apiKey,
  });
  return anthropic(model);
}
function getOpenAILikeModel(baseURL, apiKey, model) {
  const openai = createOpenAI({
    baseURL,
    apiKey,
  });
  return openai(model);
}
function getCohereAIModel(apiKey, model) {
  const cohere = createCohere({
    apiKey,
  });
  return cohere(model);
}
function getOpenAIModel(apiKey, model) {
  const openai = createOpenAI({
    apiKey,
  });
  return openai(model);
}
function getMistralModel(apiKey, model) {
  const mistral = createMistral({
    apiKey,
  });
  return mistral(model);
}
function getGoogleModel(apiKey, model) {
  const google = createGoogleGenerativeAI({
    apiKey,
  });
  return google(model);
}
function getGroqModel(apiKey, model) {
  const openai = createOpenAI({
    baseURL: 'https://api.groq.com/openai/v1',
    apiKey,
  });
  return openai(model);
}
function getHuggingFaceModel(apiKey, model) {
  const openai = createOpenAI({
    baseURL: 'https://api-inference.huggingface.co/v1/',
    apiKey,
  });
  return openai(model);
}
function getOllamaModel(baseURL, model) {
  const ollamaInstance = ollama(model, {
    numCtx: DEFAULT_NUM_CTX,
  });
  ollamaInstance.config.baseURL = `${baseURL}/api`;
  return ollamaInstance;
}
function getDeepseekModel(apiKey, model) {
  const openai = createOpenAI({
    baseURL: 'https://api.deepseek.com/beta',
    apiKey,
  });
  return openai(model);
}
function getOpenRouterModel(apiKey, model) {
  const openRouter = createOpenRouter({
    apiKey,
  });
  return openRouter.chat(model);
}
function getLMStudioModel(baseURL, model) {
  const lmstudio = createOpenAI({
    baseUrl: `${baseURL}/v1`,
    apiKey: '',
  });
  return lmstudio(model);
}
function getXAIModel(apiKey, model) {
  const openai = createOpenAI({
    baseURL: 'https://api.x.ai/v1',
    apiKey,
  });
  return openai(model);
}
function getModel(provider, model, env, apiKeys) {
  const apiKey = getAPIKey(env, provider, apiKeys);
  const baseURL = getBaseURL(env, provider);
  switch (provider) {
    case 'Anthropic':
      return getAnthropicModel(apiKey, model);
    case 'OpenAI':
      return getOpenAIModel(apiKey, model);
    case 'Groq':
      return getGroqModel(apiKey, model);
    case 'HuggingFace':
      return getHuggingFaceModel(apiKey, model);
    case 'OpenRouter':
      return getOpenRouterModel(apiKey, model);
    case 'Google':
      return getGoogleModel(apiKey, model);
    case 'OpenAILike':
      return getOpenAILikeModel(baseURL, apiKey, model);
    case 'Together':
      return getOpenAILikeModel(baseURL, apiKey, model);
    case 'Deepseek':
      return getDeepseekModel(apiKey, model);
    case 'Mistral':
      return getMistralModel(apiKey, model);
    case 'LMStudio':
      return getLMStudioModel(baseURL, model);
    case 'xAI':
      return getXAIModel(apiKey, model);
    case 'Cohere':
      return getCohereAIModel(apiKey, model);
    default:
      return getOllamaModel(baseURL, model);
  }
}

const MAX_TOKENS = 8e3;
const MAX_RESPONSE_SEGMENTS = 2;

const allowedHTMLElements = [
  'a',
  'b',
  'blockquote',
  'br',
  'code',
  'dd',
  'del',
  'details',
  'div',
  'dl',
  'dt',
  'em',
  'h1',
  'h2',
  'h3',
  'h4',
  'h5',
  'h6',
  'hr',
  'i',
  'ins',
  'kbd',
  'li',
  'ol',
  'p',
  'pre',
  'q',
  'rp',
  'rt',
  'ruby',
  's',
  'samp',
  'source',
  'span',
  'strike',
  'strong',
  'sub',
  'summary',
  'sup',
  'table',
  'tbody',
  'td',
  'tfoot',
  'th',
  'thead',
  'tr',
  'ul',
  'var',
];
({
  ...defaultSchema,
  tagNames: allowedHTMLElements,
  attributes: {
    ...defaultSchema.attributes,
    div: [...(defaultSchema.attributes?.div ?? []), 'data*', ['className', '__boltArtifact__']],
  },
  strip: [],
});

const getSystemPrompt = (cwd = WORK_DIR) => `
You are Bolt, an expert AI assistant and exceptional senior software developer with vast knowledge across multiple programming languages, frameworks, and best practices.

<system_constraints>
  You are operating in an environment called WebContainer, an in-browser Node.js runtime that emulates a Linux system to some degree. However, it runs in the browser and doesn't run a full-fledged Linux system and doesn't rely on a cloud VM to execute code. All code is executed in the browser. It does come with a shell that emulates zsh. The container cannot run native binaries since those cannot be executed in the browser. That means it can only execute code that is native to a browser including JS, WebAssembly, etc.

  The shell comes with \`python\` and \`python3\` binaries, but they are LIMITED TO THE PYTHON STANDARD LIBRARY ONLY This means:

    - There is NO \`pip\` support! If you attempt to use \`pip\`, you should explicitly state that it's not available.
    - CRITICAL: Third-party libraries cannot be installed or imported.
    - Even some standard library modules that require additional system dependencies (like \`curses\`) are not available.
    - Only modules from the core Python standard library can be used.

  Additionally, there is no \`g++\` or any C/C++ compiler available. WebContainer CANNOT run native binaries or compile C/C++ code!

  Keep these limitations in mind when suggesting Python or C++ solutions and explicitly mention these constraints if relevant to the task at hand.

  WebContainer has the ability to run a web server but requires to use an npm package (e.g., Vite, servor, serve, http-server) or use the Node.js APIs to implement a web server.

  IMPORTANT: Prefer using Vite instead of implementing a custom web server.

  IMPORTANT: Git is NOT available.

  IMPORTANT: Prefer writing Node.js scripts instead of shell scripts. The environment doesn't fully support shell scripts, so use Node.js for scripting tasks whenever possible!

  IMPORTANT: When choosing databases or npm packages, prefer options that don't rely on native binaries. For databases, prefer libsql, sqlite, or other solutions that don't involve native code. WebContainer CANNOT execute arbitrary native binaries.

  Available shell commands:
    File Operations:
      - cat: Display file contents
      - cp: Copy files/directories
      - ls: List directory contents
      - mkdir: Create directory
      - mv: Move/rename files
      - rm: Remove files
      - rmdir: Remove empty directories
      - touch: Create empty file/update timestamp
    
    System Information:
      - hostname: Show system name
      - ps: Display running processes
      - pwd: Print working directory
      - uptime: Show system uptime
      - env: Environment variables
    
    Development Tools:
      - node: Execute Node.js code
      - python3: Run Python scripts
      - code: VSCode operations
      - jq: Process JSON
    
    Other Utilities:
      - curl, head, sort, tail, clear, which, export, chmod, scho, hostname, kill, ln, xxd, alias, false,  getconf, true, loadenv, wasm, xdg-open, command, exit, source
</system_constraints>

<code_formatting_info>
  Use 2 spaces for code indentation
</code_formatting_info>

<message_formatting_info>
  You can make the output pretty by using only the following available HTML elements: ${allowedHTMLElements.map((tagName) => `<${tagName}>`).join(', ')}
</message_formatting_info>

<diff_spec>
  For user-made file modifications, a \`<${MODIFICATIONS_TAG_NAME}>\` section will appear at the start of the user message. It will contain either \`<diff>\` or \`<file>\` elements for each modified file:

    - \`<diff path="/some/file/path.ext">\`: Contains GNU unified diff format changes
    - \`<file path="/some/file/path.ext">\`: Contains the full new content of the file

  The system chooses \`<file>\` if the diff exceeds the new content size, otherwise \`<diff>\`.

  GNU unified diff format structure:

    - For diffs the header with original and modified file names is omitted!
    - Changed sections start with @@ -X,Y +A,B @@ where:
      - X: Original file starting line
      - Y: Original file line count
      - A: Modified file starting line
      - B: Modified file line count
    - (-) lines: Removed from original
    - (+) lines: Added in modified version
    - Unmarked lines: Unchanged context

  Example:

  <${MODIFICATIONS_TAG_NAME}>
    <diff path="${WORK_DIR}/src/main.js">
      @@ -2,7 +2,10 @@
        return a + b;
      }

      -console.log('Hello, World!');
      +console.log('Hello, Bolt!');
      +
      function greet() {
      -  return 'Greetings!';
      +  return 'Greetings!!';
      }
      +
      +console.log('The End');
    </diff>
    <file path="${WORK_DIR}/package.json">
      // full file content here
    </file>
  </${MODIFICATIONS_TAG_NAME}>
</diff_spec>

<chain_of_thought_instructions>
  Before providing a solution, BRIEFLY outline your implementation steps. This helps ensure systematic thinking and clear communication. Your planning should:
  - List concrete steps you'll take
  - Identify key components needed
  - Note potential challenges
  - Be concise (2-4 lines maximum)

  Example responses:

  User: "Create a todo list app with local storage"
  Assistant: "Sure. I'll start by:
  1. Set up Vite + React
  2. Create TodoList and TodoItem components
  3. Implement localStorage for persistence
  4. Add CRUD operations
  
  Let's start now.

  [Rest of response...]"

  User: "Help debug why my API calls aren't working"
  Assistant: "Great. My first steps will be:
  1. Check network requests
  2. Verify API endpoint format
  3. Examine error handling
  
  [Rest of response...]"

</chain_of_thought_instructions>

<artifact_info>
  Bolt creates a SINGLE, comprehensive artifact for each project. The artifact contains all necessary steps and components, including:

  - Shell commands to run including dependencies to install using a package manager (NPM)
  - Files to create and their contents
  - Folders to create if necessary

  <artifact_instructions>
    1. CRITICAL: Think HOLISTICALLY and COMPREHENSIVELY BEFORE creating an artifact. This means:

      - Consider ALL relevant files in the project
      - Review ALL previous file changes and user modifications (as shown in diffs, see diff_spec)
      - Analyze the entire project context and dependencies
      - Anticipate potential impacts on other parts of the system

      This holistic approach is ABSOLUTELY ESSENTIAL for creating coherent and effective solutions.

    2. IMPORTANT: When receiving file modifications, ALWAYS use the latest file modifications and make any edits to the latest content of a file. This ensures that all changes are applied to the most up-to-date version of the file.

    3. The current working directory is \`${cwd}\`.

    4. Wrap the content in opening and closing \`<boltArtifact>\` tags. These tags contain more specific \`<boltAction>\` elements.

    5. Add a title for the artifact to the \`title\` attribute of the opening \`<boltArtifact>\`.

    6. Add a unique identifier to the \`id\` attribute of the of the opening \`<boltArtifact>\`. For updates, reuse the prior identifier. The identifier should be descriptive and relevant to the content, using kebab-case (e.g., "example-code-snippet"). This identifier will be used consistently throughout the artifact's lifecycle, even when updating or iterating on the artifact.

    7. Use \`<boltAction>\` tags to define specific actions to perform.

    8. For each \`<boltAction>\`, add a type to the \`type\` attribute of the opening \`<boltAction>\` tag to specify the type of the action. Assign one of the following values to the \`type\` attribute:

      - shell: For running shell commands.

        - When Using \`npx\`, ALWAYS provide the \`--yes\` flag.
        - When running multiple shell commands, use \`&&\` to run them sequentially.
        - ULTRA IMPORTANT: Do NOT re-run a dev command with shell action use dev action to run dev commands

      - file: For writing new files or updating existing files. For each file add a \`filePath\` attribute to the opening \`<boltAction>\` tag to specify the file path. The content of the file artifact is the file contents. All file paths MUST BE relative to the current working directory.

      - start: For starting development server.
        - Use to start application if not already started or NEW dependencies added
        - Only use this action when you need to run a dev server  or start the application
        - ULTRA IMORTANT: do NOT re-run a dev server if files updated, existing dev server can autometically detect changes and executes the file changes


    9. The order of the actions is VERY IMPORTANT. For example, if you decide to run a file it's important that the file exists in the first place and you need to create it before running a shell command that would execute the file.

    10. ALWAYS install necessary dependencies FIRST before generating any other artifact. If that requires a \`package.json\` then you should create that first!

      IMPORTANT: Add all required dependencies to the \`package.json\` already and try to avoid \`npm i <pkg>\` if possible!

    11. CRITICAL: Always provide the FULL, updated content of the artifact. This means:

      - Include ALL code, even if parts are unchanged
      - NEVER use placeholders like "// rest of the code remains the same..." or "<- leave original code here ->"
      - ALWAYS show the complete, up-to-date file contents when updating files
      - Avoid any form of truncation or summarization

    12. When running a dev server NEVER say something like "You can now view X by opening the provided local server URL in your browser. The preview will be opened automatically or by the user manually!

    13. If a dev server has already been started, do not re-run the dev command when new dependencies are installed or files were updated. Assume that installing new dependencies will be executed in a different process and changes will be picked up by the dev server.

    14. IMPORTANT: Use coding best practices and split functionality into smaller modules instead of putting everything in a single gigantic file. Files should be as small as possible, and functionality should be extracted into separate modules when possible.

      - Ensure code is clean, readable, and maintainable.
      - Adhere to proper naming conventions and consistent formatting.
      - Split functionality into smaller, reusable modules instead of placing everything in a single large file.
      - Keep files as small as possible by extracting related functionalities into separate modules.
      - Use imports to connect these modules together effectively.
  </artifact_instructions>
</artifact_info>

NEVER use the word "artifact". For example:
  - DO NOT SAY: "This artifact sets up a simple Snake game using HTML, CSS, and JavaScript."
  - INSTEAD SAY: "We set up a simple Snake game using HTML, CSS, and JavaScript."

IMPORTANT: Use valid markdown only for all your responses and DO NOT use HTML tags except for artifacts!

ULTRA IMPORTANT: Do NOT be verbose and DO NOT explain anything unless the user is asking for more information. That is VERY important.

ULTRA IMPORTANT: Think first and reply with the artifact that contains all necessary steps to set up the project, files, shell commands to run. It is SUPER IMPORTANT to respond with this first.

Here are some examples of correct usage of artifacts:

<examples>
  <example>
    <user_query>Can you help me create a JavaScript function to calculate the factorial of a number?</user_query>

    <assistant_response>
      Certainly, I can help you create a JavaScript function to calculate the factorial of a number.

      <boltArtifact id="factorial-function" title="JavaScript Factorial Function">
        <boltAction type="file" filePath="index.js">
          function factorial(n) {
           ...
          }

          ...
        </boltAction>

        <boltAction type="shell">
          node index.js
        </boltAction>
      </boltArtifact>
    </assistant_response>
  </example>

  <example>
    <user_query>Build a snake game</user_query>

    <assistant_response>
      Certainly! I'd be happy to help you build a snake game using JavaScript and HTML5 Canvas. This will be a basic implementation that you can later expand upon. Let's create the game step by step.

      <boltArtifact id="snake-game" title="Snake Game in HTML and JavaScript">
        <boltAction type="file" filePath="package.json">
          {
            "name": "snake",
            "scripts": {
              "dev": "vite"
            }
            ...
          }
        </boltAction>

        <boltAction type="shell">
          npm install --save-dev vite
        </boltAction>

        <boltAction type="file" filePath="index.html">
          ...
        </boltAction>

        <boltAction type="start">
          npm run dev
        </boltAction>
      </boltArtifact>

      Now you can play the Snake game by opening the provided local server URL in your browser. Use the arrow keys to control the snake. Eat the red food to grow and increase your score. The game ends if you hit the wall or your own tail.
    </assistant_response>
  </example>

  <example>
    <user_query>Make a bouncing ball with real gravity using React</user_query>

    <assistant_response>
      Certainly! I'll create a bouncing ball with real gravity using React. We'll use the react-spring library for physics-based animations.

      <boltArtifact id="bouncing-ball-react" title="Bouncing Ball with Gravity in React">
        <boltAction type="file" filePath="package.json">
          {
            "name": "bouncing-ball",
            "private": true,
            "version": "0.0.0",
            "type": "module",
            "scripts": {
              "dev": "vite",
              "build": "vite build",
              "preview": "vite preview"
            },
            "dependencies": {
              "react": "^18.2.0",
              "react-dom": "^18.2.0",
              "react-spring": "^9.7.1"
            },
            "devDependencies": {
              "@types/react": "^18.0.28",
              "@types/react-dom": "^18.0.11",
              "@vitejs/plugin-react": "^3.1.0",
              "vite": "^4.2.0"
            }
          }
        </boltAction>

        <boltAction type="file" filePath="index.html">
          ...
        </boltAction>

        <boltAction type="file" filePath="src/main.jsx">
          ...
        </boltAction>

        <boltAction type="file" filePath="src/index.css">
          ...
        </boltAction>

        <boltAction type="file" filePath="src/App.jsx">
          ...
        </boltAction>

        <boltAction type="start">
          npm run dev
        </boltAction>
      </boltArtifact>

      You can now view the bouncing ball animation in the preview. The ball will start falling from the top of the screen and bounce realistically when it hits the bottom.
    </assistant_response>
  </example>
</examples>
`;
const CONTINUE_PROMPT = stripIndents`
  Continue your prior response. IMPORTANT: Immediately begin from where you left off without any interruptions.
  Do not repeat any content, including artifact and action tags.
`;

function extractPropertiesFromMessage(message) {
  const modelMatch = message.content.match(MODEL_REGEX);
  const model = modelMatch ? modelMatch[1] : DEFAULT_MODEL;
  const providerMatch = message.content.match(PROVIDER_REGEX);
  const provider = providerMatch ? providerMatch[1] : DEFAULT_PROVIDER;
  const cleanedContent = message.content.replace(MODEL_REGEX, '').replace(PROVIDER_REGEX, '').trim();
  return { model, provider, content: cleanedContent };
}
function streamText(messages, env, options, apiKeys) {
  let currentModel = DEFAULT_MODEL;
  let currentProvider = DEFAULT_PROVIDER;
  const processedMessages = messages.map((message) => {
    if (message.role === 'user') {
      const { model, provider, content } = extractPropertiesFromMessage(message);
      if (MODEL_LIST.find((m) => m.name === model)) {
        currentModel = model;
      }
      currentProvider = provider;
      return { ...message, content };
    }
    return message;
  });
  const modelDetails = MODEL_LIST.find((m) => m.name === currentModel);
  const dynamicMaxTokens = modelDetails && modelDetails.maxTokenAllowed ? modelDetails.maxTokenAllowed : MAX_TOKENS;
  return streamText$1({
    model: getModel(currentProvider, currentModel, env, apiKeys),
    system: getSystemPrompt(),
    maxTokens: dynamicMaxTokens,
    messages: convertToCoreMessages(processedMessages),
    ...options,
  });
}

const encoder = new TextEncoder();
const decoder = new TextDecoder();
async function action$1(args) {
  return enhancerAction(args);
}
async function enhancerAction({ context, request }) {
  const { message, model, provider, apiKeys } = await request.json();
  const { name: providerName } = provider;
  if (!model || typeof model !== 'string') {
    throw new Response('Invalid or missing model', {
      status: 400,
      statusText: 'Bad Request',
    });
  }
  if (!providerName || typeof providerName !== 'string') {
    throw new Response('Invalid or missing provider', {
      status: 400,
      statusText: 'Bad Request',
    });
  }
  try {
    const result = await streamText(
      [
        {
          role: 'user',
          content:
            `[Model: ${model}]

[Provider: ${providerName}]

` +
            stripIndents`
            You are a professional prompt engineer specializing in crafting precise, effective prompts.
          Your task is to enhance prompts by making them more specific, actionable, and effective.

          I want you to improve the user prompt that is wrapped in \`<original_prompt>\` tags.

          For valid prompts:
          - Make instructions explicit and unambiguous
          - Add relevant context and constraints
          - Remove redundant information
          - Maintain the core intent
          - Ensure the prompt is self-contained
          - Use professional language

          For invalid or unclear prompts:
          - Respond with a clear, professional guidance message
          - Keep responses concise and actionable
          - Maintain a helpful, constructive tone
          - Focus on what the user should provide
          - Use a standard template for consistency

          IMPORTANT: Your response must ONLY contain the enhanced prompt text.
          Do not include any explanations, metadata, or wrapper tags.

          <original_prompt>
            ${message}
          </original_prompt>
        `,
        },
      ],
      context.cloudflare.env,
      void 0,
      apiKeys,
    );
    const transformStream = new TransformStream({
      transform(chunk, controller) {
        const text = decoder.decode(chunk);
        const lines = text.split('\n').filter((line) => line.trim() !== '');
        for (const line of lines) {
          try {
            const parsed = parseStreamPart(line);
            if (parsed.type === 'text') {
              controller.enqueue(encoder.encode(parsed.value));
            }
          } catch (e) {
            console.warn('Failed to parse stream part:', line, e);
          }
        }
      },
    });
    const transformedStream = result.toDataStream().pipeThrough(transformStream);
    return new StreamingTextResponse(transformedStream);
  } catch (error) {
    console.log(error);
    if (error instanceof Error && error.message?.includes('API key')) {
      throw new Response('Invalid or missing API key', {
        status: 401,
        statusText: 'Unauthorized',
      });
    }
    throw new Response(null, {
      status: 500,
      statusText: 'Internal Server Error',
    });
  }
}

const route1 = /*#__PURE__*/ Object.freeze(
  /*#__PURE__*/ Object.defineProperty(
    {
      __proto__: null,
      action: action$1,
    },
    Symbol.toStringTag,
    { value: 'Module' },
  ),
);

async function loader$2() {
  return json(MODEL_LIST);
}

const route2 = /*#__PURE__*/ Object.freeze(
  /*#__PURE__*/ Object.defineProperty(
    {
      __proto__: null,
      loader: loader$2,
    },
    Symbol.toStringTag,
    { value: 'Module' },
  ),
);

class SwitchableStream extends TransformStream {
  _controller = null;
  _currentReader = null;
  _switches = 0;
  constructor() {
    let controllerRef;
    super({
      start(controller) {
        controllerRef = controller;
      },
    });
    if (controllerRef === void 0) {
      throw new Error('Controller not properly initialized');
    }
    this._controller = controllerRef;
  }
  async switchSource(newStream) {
    if (this._currentReader) {
      await this._currentReader.cancel();
    }
    this._currentReader = newStream.getReader();
    this._pumpStream();
    this._switches++;
  }
  async _pumpStream() {
    if (!this._currentReader || !this._controller) {
      throw new Error('Stream is not properly initialized');
    }
    try {
      while (true) {
        const { done, value } = await this._currentReader.read();
        if (done) {
          break;
        }
        this._controller.enqueue(value);
      }
    } catch (error) {
      console.log(error);
      this._controller.error(error);
    }
  }
  close() {
    if (this._currentReader) {
      this._currentReader.cancel();
    }
    this._controller?.terminate();
  }
  get switches() {
    return this._switches;
  }
}

async function action(args) {
  return chatAction(args);
}
function parseCookies(cookieHeader) {
  const cookies = {};
  const items = cookieHeader.split(';').map((cookie) => cookie.trim());
  items.forEach((item) => {
    const [name, ...rest] = item.split('=');
    if (name && rest) {
      const decodedName = decodeURIComponent(name.trim());
      const decodedValue = decodeURIComponent(rest.join('=').trim());
      cookies[decodedName] = decodedValue;
    }
  });
  return cookies;
}
async function chatAction({ context, request }) {
  const { messages } = await request.json();
  const cookieHeader = request.headers.get('Cookie');
  const apiKeys = JSON.parse(parseCookies(cookieHeader).apiKeys || '{}');
  const stream = new SwitchableStream();
  try {
    const options = {
      toolChoice: 'none',
      apiKeys,
      onFinish: async ({ text: content, finishReason }) => {
        if (finishReason !== 'length') {
          return stream.close();
        }
        if (stream.switches >= MAX_RESPONSE_SEGMENTS) {
          throw Error('Cannot continue message: Maximum segments reached');
        }
        const switchesLeft = MAX_RESPONSE_SEGMENTS - stream.switches;
        console.log(`Reached max token limit (${MAX_TOKENS}): Continuing message (${switchesLeft} switches left)`);
        messages.push({ role: 'assistant', content });
        messages.push({ role: 'user', content: CONTINUE_PROMPT });
        const result2 = await streamText(messages, context.cloudflare.env, options);
        return stream.switchSource(result2.toAIStream());
      },
    };
    const result = await streamText(messages, context.cloudflare.env, options, apiKeys);
    stream.switchSource(result.toAIStream());
    return new Response(stream.readable, {
      status: 200,
      headers: {
        contentType: 'text/plain; charset=utf-8',
      },
    });
  } catch (error) {
    console.log(error);
    if (error.message?.includes('API key')) {
      throw new Response('Invalid or missing API key', {
        status: 401,
        statusText: 'Unauthorized',
      });
    }
    throw new Response(null, {
      status: 500,
      statusText: 'Internal Server Error',
    });
  }
}

const route3 = /*#__PURE__*/ Object.freeze(
  /*#__PURE__*/ Object.defineProperty(
    {
      __proto__: null,
      action,
    },
    Symbol.toStringTag,
    { value: 'Module' },
  ),
);

const Menu = undefined;

function classNames(...args) {
  let classes = '';
  for (const arg of args) {
    classes = appendClass(classes, parseValue(arg));
  }
  return classes;
}
function parseValue(arg) {
  if (typeof arg === 'string' || typeof arg === 'number') {
    return arg;
  }
  if (typeof arg !== 'object') {
    return '';
  }
  if (Array.isArray(arg)) {
    return classNames(...arg);
  }
  let classes = '';
  for (const key in arg) {
    if (arg[key]) {
      classes = appendClass(classes, key);
    }
  }
  return classes;
}
function appendClass(value, newClass) {
  if (!newClass) {
    return value;
  }
  if (value) {
    return value + ' ' + newClass;
  }
  return value + newClass;
}

const IconButton = memo(
  ({ icon, size = 'xl', className, iconClassName, disabledClassName, disabled = false, title, onClick, children }) => {
    return /* @__PURE__ */ jsx('button', {
      className: classNames(
        'flex items-center text-bolt-elements-item-contentDefault bg-transparent enabled:hover:text-bolt-elements-item-contentActive rounded-md p-1 enabled:hover:bg-bolt-elements-item-backgroundActive disabled:cursor-not-allowed',
        {
          [classNames('opacity-30', disabledClassName)]: disabled,
        },
        className,
      ),
      title,
      disabled,
      onClick: (event) => {
        if (disabled) {
          return;
        }
        onClick?.(event);
      },
      children: children
        ? children
        : /* @__PURE__ */ jsx('div', { className: classNames(icon, getIconSize(size), iconClassName) }),
    });
  },
);
function getIconSize(size) {
  if (size === 'sm') {
    return 'text-sm';
  } else if (size === 'md') {
    return 'text-md';
  } else if (size === 'lg') {
    return 'text-lg';
  } else if (size === 'xl') {
    return 'text-xl';
  } else {
    return 'text-2xl';
  }
}

const Workbench = undefined;

const Messages = undefined;

const SendButton = undefined;

const APIKeyManager = ({ provider, apiKey, setApiKey }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [tempKey, setTempKey] = useState(apiKey);
  const handleSave = () => {
    setApiKey(tempKey);
    setIsEditing(false);
  };
  return /* @__PURE__ */ jsxs('div', {
    className: 'flex items-start sm:items-center mt-2 mb-2 flex-col sm:flex-row',
    children: [
      /* @__PURE__ */ jsxs('div', {
        children: [
          /* @__PURE__ */ jsxs('span', {
            className: 'text-sm text-bolt-elements-textSecondary',
            children: [provider?.name, ' API Key:'],
          }),
          !isEditing &&
            /* @__PURE__ */ jsxs('div', {
              className: 'flex items-center mb-4',
              children: [
                /* @__PURE__ */ jsx('span', {
                  className: 'flex-1 text-xs text-bolt-elements-textPrimary mr-2',
                  children: apiKey ? '••••••••' : 'Not set (will still work if set in .env file)',
                }),
                /* @__PURE__ */ jsx(IconButton, {
                  onClick: () => setIsEditing(true),
                  title: 'Edit API Key',
                  children: /* @__PURE__ */ jsx('div', { className: 'i-ph:pencil-simple' }),
                }),
              ],
            }),
        ],
      }),
      isEditing
        ? /* @__PURE__ */ jsxs('div', {
            className: 'flex items-center gap-3 mt-2',
            children: [
              /* @__PURE__ */ jsx('input', {
                type: 'password',
                value: tempKey,
                placeholder: 'Your API Key',
                onChange: (e) => setTempKey(e.target.value),
                className:
                  'flex-1 px-2 py-1 text-xs lg:text-sm rounded border border-bolt-elements-borderColor bg-bolt-elements-prompt-background text-bolt-elements-textPrimary focus:outline-none focus:ring-2 focus:ring-bolt-elements-focus',
              }),
              /* @__PURE__ */ jsx(IconButton, {
                onClick: handleSave,
                title: 'Save API Key',
                children: /* @__PURE__ */ jsx('div', { className: 'i-ph:check' }),
              }),
              /* @__PURE__ */ jsx(IconButton, {
                onClick: () => setIsEditing(false),
                title: 'Cancel',
                children: /* @__PURE__ */ jsx('div', { className: 'i-ph:x' }),
              }),
            ],
          })
        : /* @__PURE__ */ jsx(Fragment, {
            children:
              provider?.getApiKeyLink &&
              /* @__PURE__ */ jsxs(IconButton, {
                className: 'ml-auto',
                onClick: () => window.open(provider?.getApiKeyLink),
                title: 'Edit API Key',
                children: [
                  /* @__PURE__ */ jsx('span', {
                    className: 'mr-2 text-xs lg:text-sm',
                    children: provider?.labelForGetApiKey || 'Get API Key',
                  }),
                  /* @__PURE__ */ jsx('div', { className: provider?.icon || 'i-ph:key' }),
                ],
              }),
          }),
    ],
  });
};

const BaseChat$1 = '_';
const Chat$1 = 'a';
const RayContainer = 'b';
const LightRayOne = 'c';
const LightRayTwo = 'd';
const LightRayThree = 'e';
const LightRayFour = 'f';
const LightRayFive = 'g';
const PromptEffectContainer = 'h';
const PromptEffectLine = 'i';
const PromptShine = 'j';
const styles = {
  BaseChat: BaseChat$1,
  Chat: Chat$1,
  RayContainer: RayContainer,
  LightRayOne: LightRayOne,
  LightRayTwo: LightRayTwo,
  LightRayThree: LightRayThree,
  LightRayFour: LightRayFour,
  LightRayFive: LightRayFive,
  PromptEffectContainer: PromptEffectContainer,
  PromptEffectLine: PromptEffectLine,
  PromptShine: PromptShine,
};

const WithTooltip = ({
  tooltip,
  children,
  sideOffset = 5,
  className = '',
  arrowClassName = '',
  tooltipStyle = {},
  position = 'top',
  maxWidth = 250,
  delay = 0,
}) => {
  return /* @__PURE__ */ jsxs(Tooltip.Root, {
    delayDuration: delay,
    children: [
      /* @__PURE__ */ jsx(Tooltip.Trigger, { asChild: true, children }),
      /* @__PURE__ */ jsx(Tooltip.Portal, {
        children: /* @__PURE__ */ jsxs(Tooltip.Content, {
          side: position,
          className: `
            z-[2000]
            px-2.5
            py-1.5
            max-h-[300px]
            select-none
            rounded-md
            bg-bolt-elements-background-depth-3
            text-bolt-elements-textPrimary
            text-sm
            leading-tight
            shadow-lg
            animate-in
            fade-in-0
            zoom-in-95
            data-[state=closed]:animate-out
            data-[state=closed]:fade-out-0
            data-[state=closed]:zoom-out-95
            ${className}
          `,
          sideOffset,
          style: {
            maxWidth,
            ...tooltipStyle,
          },
          children: [
            /* @__PURE__ */ jsx('div', { className: 'break-words', children: tooltip }),
            /* @__PURE__ */ jsx(Tooltip.Arrow, {
              className: `
              fill-bolt-elements-background-depth-3
              ${arrowClassName}
            `,
              width: 12,
              height: 6,
            }),
          ],
        }),
      }),
    ],
  });
};

const ExportChatButton = ({ exportChat }) => {
  return /* @__PURE__ */ jsx(WithTooltip, {
    tooltip: 'Export Chat',
    children: /* @__PURE__ */ jsx(IconButton, {
      title: 'Export Chat',
      onClick: () => exportChat?.(),
      children: /* @__PURE__ */ jsx('div', { className: 'i-ph:download-simple text-xl' }),
    }),
  });
};

const IGNORE_PATTERNS = [
  'node_modules/**',
  '.git/**',
  'dist/**',
  'build/**',
  '.next/**',
  'coverage/**',
  '.cache/**',
  '.vscode/**',
  '.idea/**',
  '**/*.log',
  '**/.DS_Store',
  '**/npm-debug.log*',
  '**/yarn-debug.log*',
  '**/yarn-error.log*',
];
const ig = ignore().add(IGNORE_PATTERNS);
const generateId = () => Math.random().toString(36).substring(2, 15);
const isBinaryFile = async (file) => {
  const chunkSize = 1024;
  const buffer = new Uint8Array(await file.slice(0, chunkSize).arrayBuffer());
  for (let i = 0; i < buffer.length; i++) {
    const byte = buffer[i];
    if (byte === 0 || (byte < 32 && byte !== 9 && byte !== 10 && byte !== 13)) {
      return true;
    }
  }
  return false;
};
const ImportFolderButton = ({ className, importChat }) => {
  const shouldIncludeFile = (path) => {
    return !ig.ignores(path);
  };
  const createChatFromFolder = async (files, binaryFiles) => {
    const fileArtifacts = await Promise.all(
      files.map(async (file) => {
        return new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => {
            const content = reader.result;
            const relativePath = file.webkitRelativePath.split('/').slice(1).join('/');
            resolve(
              `<boltAction type="file" filePath="${relativePath}">
${content}
</boltAction>`,
            );
          };
          reader.onerror = reject;
          reader.readAsText(file);
        });
      }),
    );
    const binaryFilesMessage =
      binaryFiles.length > 0
        ? `

Skipped ${binaryFiles.length} binary files:
${binaryFiles.map((f) => `- ${f}`).join('\n')}`
        : '';
    const message = {
      role: 'assistant',
      content: `I'll help you set up these files.${binaryFilesMessage}

<boltArtifact id="imported-files" title="Imported Files">
${fileArtifacts.join('\n\n')}
</boltArtifact>`,
      id: generateId(),
      createdAt: /* @__PURE__ */ new Date(),
    };
    const userMessage = {
      role: 'user',
      id: generateId(),
      content: 'Import my files',
      createdAt: /* @__PURE__ */ new Date(),
    };
    const description = `Folder Import: ${files[0].webkitRelativePath.split('/')[0]}`;
    if (importChat) {
      await importChat(description, [userMessage, message]);
    }
  };
  return /* @__PURE__ */ jsxs(Fragment, {
    children: [
      /* @__PURE__ */ jsx('input', {
        type: 'file',
        id: 'folder-import',
        className: 'hidden',
        webkitdirectory: '',
        directory: '',
        onChange: async (e) => {
          const allFiles = Array.from(e.target.files || []);
          const filteredFiles = allFiles.filter((file) => shouldIncludeFile(file.webkitRelativePath));
          if (filteredFiles.length === 0) {
            toast.error('No files found in the selected folder');
            return;
          }
          try {
            const fileChecks = await Promise.all(
              filteredFiles.map(async (file) => ({
                file,
                isBinary: await isBinaryFile(file),
              })),
            );
            const textFiles = fileChecks.filter((f) => !f.isBinary).map((f) => f.file);
            const binaryFilePaths = fileChecks
              .filter((f) => f.isBinary)
              .map((f) => f.file.webkitRelativePath.split('/').slice(1).join('/'));
            if (textFiles.length === 0) {
              toast.error('No text files found in the selected folder');
              return;
            }
            if (binaryFilePaths.length > 0) {
              toast.info(`Skipping ${binaryFilePaths.length} binary files`);
            }
            await createChatFromFolder(textFiles, binaryFilePaths);
          } catch (error) {
            console.error('Failed to import folder:', error);
            toast.error('Failed to import folder');
          }
          e.target.value = '';
        },
        ...{},
      }),
      /* @__PURE__ */ jsxs('button', {
        onClick: () => {
          const input = document.getElementById('folder-import');
          input?.click();
        },
        className,
        children: [/* @__PURE__ */ jsx('div', { className: 'i-ph:upload-simple' }), 'Import Folder'],
      }),
    ],
  });
};

function ImportButtons(importChat) {
  return /* @__PURE__ */ jsxs('div', {
    className: 'flex flex-col items-center justify-center flex-1 p-4',
    children: [
      /* @__PURE__ */ jsx('input', {
        type: 'file',
        id: 'chat-import',
        className: 'hidden',
        accept: '.json',
        onChange: async (e) => {
          const file = e.target.files?.[0];
          if (file && importChat) {
            try {
              const reader = new FileReader();
              reader.onload = async (e2) => {
                try {
                  const content = e2.target?.result;
                  const data = JSON.parse(content);
                  if (!Array.isArray(data.messages)) {
                    toast.error('Invalid chat file format');
                  }
                  await importChat(data.description, data.messages);
                  toast.success('Chat imported successfully');
                } catch (error) {
                  if (error instanceof Error) {
                    toast.error('Failed to parse chat file: ' + error.message);
                  } else {
                    toast.error('Failed to parse chat file');
                  }
                }
              };
              reader.onerror = () => toast.error('Failed to read chat file');
              reader.readAsText(file);
            } catch (error) {
              toast.error(error instanceof Error ? error.message : 'Failed to import chat');
            }
            e.target.value = '';
          } else {
            toast.error('Something went wrong');
          }
        },
      }),
      /* @__PURE__ */ jsx('div', {
        className: 'flex flex-col items-center gap-4 max-w-2xl text-center',
        children: /* @__PURE__ */ jsxs('div', {
          className: 'flex gap-2',
          children: [
            /* @__PURE__ */ jsxs('button', {
              onClick: () => {
                const input = document.getElementById('chat-import');
                input?.click();
              },
              className:
                'px-4 py-2 rounded-lg border border-bolt-elements-borderColor bg-bolt-elements-prompt-background text-bolt-elements-textPrimary hover:bg-bolt-elements-background-depth-3 transition-all flex items-center gap-2',
              children: [/* @__PURE__ */ jsx('div', { className: 'i-ph:upload-simple' }), 'Import Chat'],
            }),
            /* @__PURE__ */ jsx(ImportFolderButton, {
              importChat,
              className:
                'px-4 py-2 rounded-lg border border-bolt-elements-borderColor bg-bolt-elements-prompt-background text-bolt-elements-textPrimary hover:bg-bolt-elements-background-depth-3 transition-all flex items-center gap-2',
            }),
          ],
        }),
      }),
    ],
  });
}

const EXAMPLE_PROMPTS = [
  { text: 'Build a todo app in React using Tailwind' },
  { text: 'Build a simple blog using Astro' },
  { text: 'Create a cookie consent form using Material UI' },
  { text: 'Make a space invaders game' },
  { text: 'Make a Tic Tac Toe game in html, css and js only' },
];
function ExamplePrompts(sendMessage) {
  return /* @__PURE__ */ jsx('div', {
    id: 'examples',
    className: 'relative flex flex-col gap-9 w-full max-w-3xl mx-auto flex justify-center mt-6',
    children: /* @__PURE__ */ jsx('div', {
      className: 'flex flex-wrap justify-center gap-2',
      style: {
        animation: '.25s ease-out 0s 1 _fade-and-move-in_g2ptj_1 forwards',
      },
      children: EXAMPLE_PROMPTS.map((examplePrompt, index) => {
        return /* @__PURE__ */ jsx(
          'button',
          {
            onClick: (event) => {
              sendMessage?.(event, examplePrompt.text);
            },
            className:
              'border border-bolt-elements-borderColor rounded-full bg-gray-50 hover:bg-gray-100 dark:bg-gray-950 dark:hover:bg-gray-900 text-bolt-elements-textSecondary hover:text-bolt-elements-textPrimary px-3 py-1 text-xs transition-theme',
            children: examplePrompt.text,
          },
          index,
        );
      }),
    }),
  });
}

const ModelSelector = ({ model, setModel, provider, setProvider, modelList, providerList, apiKeys }) => {
  return /* @__PURE__ */ jsxs('div', {
    className: 'mb-2 flex gap-2 flex-col sm:flex-row',
    children: [
      /* @__PURE__ */ jsx('select', {
        value: provider?.name,
        onChange: (e) => {
          setProvider(providerList.find((p) => p.name === e.target.value));
          const firstModel = [...modelList].find((m) => m.provider == e.target.value);
          setModel(firstModel ? firstModel.name : '');
        },
        className:
          'flex-1 p-2 rounded-lg border border-bolt-elements-borderColor bg-bolt-elements-prompt-background text-bolt-elements-textPrimary focus:outline-none focus:ring-2 focus:ring-bolt-elements-focus transition-all',
        children: providerList.map((provider2) =>
          /* @__PURE__ */ jsx('option', { value: provider2.name, children: provider2.name }, provider2.name),
        ),
      }),
      /* @__PURE__ */ jsx(
        'select',
        {
          value: model,
          onChange: (e) => setModel(e.target.value),
          className:
            'flex-1 p-2 rounded-lg border border-bolt-elements-borderColor bg-bolt-elements-prompt-background text-bolt-elements-textPrimary focus:outline-none focus:ring-2 focus:ring-bolt-elements-focus transition-all lg:max-w-[70%]',
          children: [...modelList]
            .filter((e) => e.provider == provider?.name && e.name)
            .map((modelOption) =>
              /* @__PURE__ */ jsx('option', { value: modelOption.name, children: modelOption.label }, modelOption.name),
            ),
        },
        provider?.name,
      ),
    ],
  });
};
const TEXTAREA_MIN_HEIGHT = 76;
const BaseChat = React.forwardRef(
  (
    {
      textareaRef,
      messageRef,
      scrollRef,
      showChat = true,
      chatStarted = false,
      isStreaming = false,
      enhancingPrompt = false,
      promptEnhanced = false,
      messages,
      input = '',
      model,
      setModel,
      provider,
      setProvider,
      sendMessage,
      handleInputChange,
      enhancePrompt,
      handleStop,
      importChat,
      exportChat,
    },
    ref,
  ) => {
    const TEXTAREA_MAX_HEIGHT = chatStarted ? 400 : 200;
    const [apiKeys, setApiKeys] = useState({});
    const [modelList, setModelList] = useState(MODEL_LIST);
    const [isModelSettingsCollapsed, setIsModelSettingsCollapsed] = useState(false);
    useEffect(() => {
      try {
        const storedApiKeys = Cookies.get('apiKeys');
        if (storedApiKeys) {
          const parsedKeys = JSON.parse(storedApiKeys);
          if (typeof parsedKeys === 'object' && parsedKeys !== null) {
            setApiKeys(parsedKeys);
          }
        }
      } catch (error) {
        console.error('Error loading API keys from cookies:', error);
        Cookies.remove('apiKeys');
      }
      initializeModelList().then((modelList2) => {
        setModelList(modelList2);
      });
    }, []);
    const updateApiKey = (provider2, key) => {
      try {
        const updatedApiKeys = { ...apiKeys, [provider2]: key };
        setApiKeys(updatedApiKeys);
        Cookies.set('apiKeys', JSON.stringify(updatedApiKeys), {
          expires: 30,
          // 30 days
          secure: true,
          // Only send over HTTPS
          sameSite: 'strict',
          // Protect against CSRF
          path: '/',
          // Accessible across the site
        });
      } catch (error) {
        console.error('Error saving API keys to cookies:', error);
      }
    };
    const baseChat = /* @__PURE__ */ jsxs('div', {
      ref,
      className: classNames(
        styles.BaseChat,
        'relative flex flex-col lg:flex-row h-full w-full overflow-hidden bg-bolt-elements-background-depth-1',
      ),
      'data-chat-visible': showChat,
      children: [
        /* @__PURE__ */ jsxs('div', {
          className: classNames(styles.RayContainer),
          children: [
            /* @__PURE__ */ jsx('div', { className: classNames(styles.LightRayOne) }),
            /* @__PURE__ */ jsx('div', { className: classNames(styles.LightRayTwo) }),
            /* @__PURE__ */ jsx('div', { className: classNames(styles.LightRayThree) }),
            /* @__PURE__ */ jsx('div', { className: classNames(styles.LightRayFour) }),
            /* @__PURE__ */ jsx('div', { className: classNames(styles.LightRayFive) }),
          ],
        }),
        /* @__PURE__ */ jsx(ClientOnly, { children: () => /* @__PURE__ */ jsx(Menu, {}) }),
        /* @__PURE__ */ jsxs('div', {
          ref: scrollRef,
          className: 'flex flex-col lg:flex-row overflow-y-auto w-full h-full',
          children: [
            /* @__PURE__ */ jsxs('div', {
              className: classNames(styles.Chat, 'flex flex-col flex-grow lg:min-w-[var(--chat-min-width)] h-full'),
              children: [
                !chatStarted &&
                  /* @__PURE__ */ jsxs('div', {
                    id: 'intro',
                    className: 'mt-[26vh] max-w-chat mx-auto text-center px-4 lg:px-0',
                    children: [
                      /* @__PURE__ */ jsx('h1', {
                        className: 'text-3xl lg:text-6xl font-bold text-bolt-elements-textPrimary mb-4 animate-fade-in',
                        children: 'Where ideas begin',
                      }),
                      /* @__PURE__ */ jsx('p', {
                        className:
                          'text-md lg:text-xl mb-8 text-bolt-elements-textSecondary animate-fade-in animation-delay-200',
                        children: 'Bring ideas to life in seconds or get help on existing projects.',
                      }),
                    ],
                  }),
                /* @__PURE__ */ jsxs('div', {
                  className: classNames('pt-6 px-2 sm:px-6', {
                    'h-full flex flex-col': chatStarted,
                  }),
                  children: [
                    /* @__PURE__ */ jsx(ClientOnly, {
                      children: () => {
                        return chatStarted
                          ? /* @__PURE__ */ jsx(Messages, {
                              ref: messageRef,
                              className: 'flex flex-col w-full flex-1 max-w-chat pb-6 mx-auto z-1',
                              messages,
                              isStreaming,
                            })
                          : null;
                      },
                    }),
                    /* @__PURE__ */ jsxs('div', {
                      className: classNames(
                        'bg-bolt-elements-background-depth-2 p-3 rounded-lg border border-bolt-elements-borderColor relative w-full max-w-chat mx-auto z-prompt mb-6',
                        {
                          'sticky bottom-2': chatStarted,
                        },
                      ),
                      children: [
                        /* @__PURE__ */ jsxs('svg', {
                          className: classNames(styles.PromptEffectContainer),
                          children: [
                            /* @__PURE__ */ jsxs('defs', {
                              children: [
                                /* @__PURE__ */ jsxs('linearGradient', {
                                  id: 'line-gradient',
                                  x1: '20%',
                                  y1: '0%',
                                  x2: '-14%',
                                  y2: '10%',
                                  gradientUnits: 'userSpaceOnUse',
                                  gradientTransform: 'rotate(-45)',
                                  children: [
                                    /* @__PURE__ */ jsx('stop', {
                                      offset: '0%',
                                      stopColor: '#1488fc',
                                      stopOpacity: '0%',
                                    }),
                                    /* @__PURE__ */ jsx('stop', {
                                      offset: '40%',
                                      stopColor: '#1488fc',
                                      stopOpacity: '80%',
                                    }),
                                    /* @__PURE__ */ jsx('stop', {
                                      offset: '50%',
                                      stopColor: '#1488fc',
                                      stopOpacity: '80%',
                                    }),
                                    /* @__PURE__ */ jsx('stop', {
                                      offset: '100%',
                                      stopColor: '#1488fc',
                                      stopOpacity: '0%',
                                    }),
                                  ],
                                }),
                                /* @__PURE__ */ jsxs('linearGradient', {
                                  id: 'shine-gradient',
                                  children: [
                                    /* @__PURE__ */ jsx('stop', {
                                      offset: '0%',
                                      stopColor: 'white',
                                      stopOpacity: '0%',
                                    }),
                                    /* @__PURE__ */ jsx('stop', {
                                      offset: '40%',
                                      stopColor: '#8adaff',
                                      stopOpacity: '80%',
                                    }),
                                    /* @__PURE__ */ jsx('stop', {
                                      offset: '50%',
                                      stopColor: '#8adaff',
                                      stopOpacity: '80%',
                                    }),
                                    /* @__PURE__ */ jsx('stop', {
                                      offset: '100%',
                                      stopColor: 'white',
                                      stopOpacity: '0%',
                                    }),
                                  ],
                                }),
                              ],
                            }),
                            /* @__PURE__ */ jsx('rect', {
                              className: classNames(styles.PromptEffectLine),
                              pathLength: '100',
                              strokeLinecap: 'round',
                            }),
                            /* @__PURE__ */ jsx('rect', {
                              className: classNames(styles.PromptShine),
                              x: '48',
                              y: '24',
                              width: '70',
                              height: '1',
                            }),
                          ],
                        }),
                        /* @__PURE__ */ jsxs('div', {
                          children: [
                            /* @__PURE__ */ jsx('div', {
                              className: 'flex justify-between items-center mb-2',
                              children: /* @__PURE__ */ jsxs('button', {
                                onClick: () => setIsModelSettingsCollapsed(!isModelSettingsCollapsed),
                                className: classNames('flex items-center gap-2 p-2 rounded-lg transition-all', {
                                  'bg-bolt-elements-item-backgroundAccent text-bolt-elements-item-contentAccent':
                                    isModelSettingsCollapsed,
                                  'bg-bolt-elements-item-backgroundDefault text-bolt-elements-item-contentDefault':
                                    !isModelSettingsCollapsed,
                                }),
                                children: [
                                  /* @__PURE__ */ jsx('div', {
                                    className: `i-ph:caret-${isModelSettingsCollapsed ? 'right' : 'down'} text-lg`,
                                  }),
                                  /* @__PURE__ */ jsx('span', { children: 'Model Settings' }),
                                ],
                              }),
                            }),
                            /* @__PURE__ */ jsxs('div', {
                              className: isModelSettingsCollapsed ? 'hidden' : '',
                              children: [
                                /* @__PURE__ */ jsx(
                                  ModelSelector,
                                  {
                                    model,
                                    setModel,
                                    modelList,
                                    provider,
                                    setProvider,
                                    providerList: PROVIDER_LIST,
                                    apiKeys,
                                  },
                                  provider?.name + ':' + modelList.length,
                                ),
                                provider &&
                                  /* @__PURE__ */ jsx(APIKeyManager, {
                                    provider,
                                    apiKey: apiKeys[provider.name] || '',
                                    setApiKey: (key) => updateApiKey(provider.name, key),
                                  }),
                              ],
                            }),
                          ],
                        }),
                        /* @__PURE__ */ jsxs('div', {
                          className: classNames(
                            'relative shadow-xs border border-bolt-elements-borderColor backdrop-blur rounded-lg',
                          ),
                          children: [
                            /* @__PURE__ */ jsx('textarea', {
                              ref: textareaRef,
                              className:
                                'w-full pl-4 pt-4 pr-16 focus:outline-none resize-none text-bolt-elements-textPrimary placeholder-bolt-elements-textTertiary bg-transparent text-sm',
                              onKeyDown: (event) => {
                                if (event.key === 'Enter') {
                                  if (event.shiftKey) {
                                    return;
                                  }
                                  event.preventDefault();
                                  sendMessage?.(event);
                                }
                              },
                              value: input,
                              onChange: (event) => {
                                handleInputChange?.(event);
                              },
                              style: {
                                minHeight: TEXTAREA_MIN_HEIGHT,
                                maxHeight: TEXTAREA_MAX_HEIGHT,
                              },
                              placeholder: 'How can Bolt help you today?',
                              translate: 'no',
                            }),
                            /* @__PURE__ */ jsx(ClientOnly, {
                              children: () =>
                                /* @__PURE__ */ jsx(SendButton, {
                                  show: input.length > 0 || isStreaming,
                                  isStreaming,
                                  onClick: (event) => {
                                    if (isStreaming) {
                                      handleStop?.();
                                      return;
                                    }
                                    sendMessage?.(event);
                                  },
                                }),
                            }),
                            /* @__PURE__ */ jsxs('div', {
                              className: 'flex justify-between items-center text-sm p-4 pt-2',
                              children: [
                                /* @__PURE__ */ jsxs('div', {
                                  className: 'flex gap-1 items-center',
                                  children: [
                                    /* @__PURE__ */ jsx(IconButton, {
                                      title: 'Enhance prompt',
                                      disabled: input.length === 0 || enhancingPrompt,
                                      className: classNames('transition-all', {
                                        'opacity-100!': enhancingPrompt,
                                        'text-bolt-elements-item-contentAccent! pr-1.5 enabled:hover:bg-bolt-elements-item-backgroundAccent!':
                                          promptEnhanced,
                                      }),
                                      onClick: () => enhancePrompt?.(),
                                      children: enhancingPrompt
                                        ? /* @__PURE__ */ jsxs(Fragment, {
                                            children: [
                                              /* @__PURE__ */ jsx('div', {
                                                className:
                                                  'i-svg-spinners:90-ring-with-bg text-bolt-elements-loader-progress text-xl animate-spin',
                                              }),
                                              /* @__PURE__ */ jsx('div', {
                                                className: 'ml-1.5',
                                                children: 'Enhancing prompt...',
                                              }),
                                            ],
                                          })
                                        : /* @__PURE__ */ jsxs(Fragment, {
                                            children: [
                                              /* @__PURE__ */ jsx('div', { className: 'i-bolt:stars text-xl' }),
                                              promptEnhanced &&
                                                /* @__PURE__ */ jsx('div', {
                                                  className: 'ml-1.5',
                                                  children: 'Prompt enhanced',
                                                }),
                                            ],
                                          }),
                                    }),
                                    chatStarted &&
                                      /* @__PURE__ */ jsx(ClientOnly, {
                                        children: () => /* @__PURE__ */ jsx(ExportChatButton, { exportChat }),
                                      }),
                                  ],
                                }),
                                input.length > 3
                                  ? /* @__PURE__ */ jsxs('div', {
                                      className: 'text-xs text-bolt-elements-textTertiary',
                                      children: [
                                        'Use ',
                                        /* @__PURE__ */ jsx('kbd', {
                                          className: 'kdb px-1.5 py-0.5 rounded bg-bolt-elements-background-depth-2',
                                          children: 'Shift',
                                        }),
                                        ' +',
                                        ' ',
                                        /* @__PURE__ */ jsx('kbd', {
                                          className: 'kdb px-1.5 py-0.5 rounded bg-bolt-elements-background-depth-2',
                                          children: 'Return',
                                        }),
                                        ' a new line',
                                      ],
                                    })
                                  : null,
                              ],
                            }),
                          ],
                        }),
                      ],
                    }),
                  ],
                }),
                !chatStarted && ImportButtons(importChat),
                !chatStarted && ExamplePrompts(sendMessage),
              ],
            }),
            /* @__PURE__ */ jsx(ClientOnly, {
              children: () => /* @__PURE__ */ jsx(Workbench, { chatStarted, isStreaming }),
            }),
          ],
        }),
      ],
    });
    return /* @__PURE__ */ jsx(Tooltip.Provider, { delayDuration: 200, children: baseChat });
  },
);

const Chat = undefined;

const chatStore = map({
  started: false,
  aborted: false,
  showChat: true,
});

const HeaderActionButtons = undefined;

const ChatDescription = undefined;

function Header() {
  const chat = useStore(chatStore);
  return /* @__PURE__ */ jsxs('header', {
    className: classNames(
      'flex items-center bg-bolt-elements-background-depth-1 p-5 border-b h-[var(--header-height)]',
      {
        'border-transparent': !chat.started,
        'border-bolt-elements-borderColor': chat.started,
      },
    ),
    children: [
      /* @__PURE__ */ jsxs('div', {
        className: 'flex items-center gap-2 z-logo text-bolt-elements-textPrimary cursor-pointer',
        children: [
          /* @__PURE__ */ jsx('div', { className: 'i-ph:sidebar-simple-duotone text-xl' }),
          /* @__PURE__ */ jsx('a', {
            href: '/',
            className: 'text-2xl font-semibold text-accent flex items-center',
            children: /* @__PURE__ */ jsx('span', { className: 'i-bolt:logo-text?mask w-[46px] inline-block' }),
          }),
        ],
      }),
      chat.started && // Display ChatDescription and HeaderActionButtons only when the chat has started.
        /* @__PURE__ */ jsxs(Fragment, {
          children: [
            /* @__PURE__ */ jsx('span', {
              className: 'flex-1 px-4 truncate text-center text-bolt-elements-textPrimary',
              children: /* @__PURE__ */ jsx(ClientOnly, { children: () => /* @__PURE__ */ jsx(ChatDescription, {}) }),
            }),
            /* @__PURE__ */ jsx(ClientOnly, {
              children: () =>
                /* @__PURE__ */ jsx('div', {
                  className: 'mr-1',
                  children: /* @__PURE__ */ jsx(HeaderActionButtons, {}),
                }),
            }),
          ],
        }),
    ],
  });
}

const meta = () => {
  return [{ title: 'Bolt' }, { name: 'description', content: 'Talk with Bolt, an AI assistant from StackBlitz' }];
};
const loader$1 = () => json({});
function Index() {
  return /* @__PURE__ */ jsxs('div', {
    className: 'flex flex-col h-full w-full',
    children: [
      /* @__PURE__ */ jsx(Header, {}),
      /* @__PURE__ */ jsx(ClientOnly, {
        fallback: /* @__PURE__ */ jsx(BaseChat, {}),
        children: () => /* @__PURE__ */ jsx(Chat, {}),
      }),
    ],
  });
}

const route5 = /*#__PURE__*/ Object.freeze(
  /*#__PURE__*/ Object.defineProperty(
    {
      __proto__: null,
      default: Index,
      loader: loader$1,
      meta,
    },
    Symbol.toStringTag,
    { value: 'Module' },
  ),
);

async function loader(args) {
  return json({ id: args.params.id });
}

const route4 = /*#__PURE__*/ Object.freeze(
  /*#__PURE__*/ Object.defineProperty(
    {
      __proto__: null,
      default: Index,
      loader,
    },
    Symbol.toStringTag,
    { value: 'Module' },
  ),
);

const serverManifest = {
  entry: { module: '/assets/entry.client-DUAjGS6-.js', imports: ['/assets/components-NEFRR7yZ.js'], css: [] },
  routes: {
    root: {
      id: 'root',
      parentId: undefined,
      path: '',
      index: undefined,
      caseSensitive: undefined,
      hasAction: false,
      hasLoader: false,
      hasClientAction: false,
      hasClientLoader: false,
      hasErrorBoundary: false,
      module: '/assets/root-CS5JrQJX.js',
      imports: ['/assets/components-NEFRR7yZ.js', '/assets/theme-CjjiMA0D.js'],
      css: ['/assets/root-BSaEMI1x.css'],
    },
    'routes/api.enhancer': {
      id: 'routes/api.enhancer',
      parentId: 'root',
      path: 'api/enhancer',
      index: undefined,
      caseSensitive: undefined,
      hasAction: true,
      hasLoader: false,
      hasClientAction: false,
      hasClientLoader: false,
      hasErrorBoundary: false,
      module: '/assets/api.enhancer-l0sNRNKZ.js',
      imports: [],
      css: [],
    },
    'routes/api.models': {
      id: 'routes/api.models',
      parentId: 'root',
      path: 'api/models',
      index: undefined,
      caseSensitive: undefined,
      hasAction: false,
      hasLoader: true,
      hasClientAction: false,
      hasClientLoader: false,
      hasErrorBoundary: false,
      module: '/assets/api.models-l0sNRNKZ.js',
      imports: [],
      css: [],
    },
    'routes/api.chat': {
      id: 'routes/api.chat',
      parentId: 'root',
      path: 'api/chat',
      index: undefined,
      caseSensitive: undefined,
      hasAction: true,
      hasLoader: false,
      hasClientAction: false,
      hasClientLoader: false,
      hasErrorBoundary: false,
      module: '/assets/api.chat-l0sNRNKZ.js',
      imports: [],
      css: [],
    },
    'routes/chat.$id': {
      id: 'routes/chat.$id',
      parentId: 'root',
      path: 'chat/:id',
      index: undefined,
      caseSensitive: undefined,
      hasAction: false,
      hasLoader: true,
      hasClientAction: false,
      hasClientLoader: false,
      hasErrorBoundary: false,
      module: '/assets/chat._id-D0T4q5EB.js',
      imports: ['/assets/_index-Ckwnt1Tc.js', '/assets/components-NEFRR7yZ.js', '/assets/theme-CjjiMA0D.js'],
      css: ['/assets/_index-DrUSZavq.css'],
    },
    'routes/_index': {
      id: 'routes/_index',
      parentId: 'root',
      path: undefined,
      index: true,
      caseSensitive: undefined,
      hasAction: false,
      hasLoader: true,
      hasClientAction: false,
      hasClientLoader: false,
      hasErrorBoundary: false,
      module: '/assets/_index-Bfj4fm5S.js',
      imports: ['/assets/_index-Ckwnt1Tc.js', '/assets/components-NEFRR7yZ.js', '/assets/theme-CjjiMA0D.js'],
      css: ['/assets/_index-DrUSZavq.css'],
    },
  },
  url: '/assets/manifest-f1f2fe85.js',
  version: 'f1f2fe85',
};

/**
 * `mode` is only relevant for the old Remix compiler but
 * is included here to satisfy the `ServerBuild` typings.
 */
const mode = 'production';
const assetsBuildDirectory = 'build\\client';
const basename = '/';
const future = {
  v3_fetcherPersist: true,
  v3_relativeSplatPath: true,
  v3_throwAbortReason: true,
  v3_routeConfig: false,
  v3_singleFetch: false,
  v3_lazyRouteDiscovery: true,
  unstable_optimizeDeps: false,
};
const isSpaMode = false;
const publicPath = '/';
const entry = { module: entryServer };
const routes = {
  root: {
    id: 'root',
    parentId: undefined,
    path: '',
    index: undefined,
    caseSensitive: undefined,
    module: route0,
  },
  'routes/api.enhancer': {
    id: 'routes/api.enhancer',
    parentId: 'root',
    path: 'api/enhancer',
    index: undefined,
    caseSensitive: undefined,
    module: route1,
  },
  'routes/api.models': {
    id: 'routes/api.models',
    parentId: 'root',
    path: 'api/models',
    index: undefined,
    caseSensitive: undefined,
    module: route2,
  },
  'routes/api.chat': {
    id: 'routes/api.chat',
    parentId: 'root',
    path: 'api/chat',
    index: undefined,
    caseSensitive: undefined,
    module: route3,
  },
  'routes/chat.$id': {
    id: 'routes/chat.$id',
    parentId: 'root',
    path: 'chat/:id',
    index: undefined,
    caseSensitive: undefined,
    module: route4,
  },
  'routes/_index': {
    id: 'routes/_index',
    parentId: 'root',
    path: undefined,
    index: true,
    caseSensitive: undefined,
    module: route5,
  },
};

export { serverManifest as assets, assetsBuildDirectory, basename, entry, future, isSpaMode, mode, publicPath, routes };
