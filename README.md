# Explain Code VS Extension README

The minimalistic 'Explain Code' extension for Visual Studio Code allows developers to easily understand and explain complex code. Using the OpenAI GPT-3 language model, the extension generates natural language explanations for code snippets and entire files that can be accessed without having to leave the IDE.

Made with ☕ by [Eimen](https://twitter.com/eimenhmdt)

## Features

- Generates natural language explanations for code snippets and entire files.
- Utilizes the OpenAI GPT-3 language model for accurate and human-like explanations.
- Easy to use:
  - Explain code snippets: highlight code, right click, click "Explain selected code"
  - Explain whole file: Click on the "Explain Code" button in the bottom right of your IDE

## Requirements

A valid OpenAI API key, which can be obtained from the [OpenAI website](https://openai.com/)

## Extension Settings

The Explain Code extension contributes the following setting:

- openaiKey: Your OpenAI API key, which is used to access the GPT-3 language model.

## Known Issues

- If the OpenAI API key is not set, the extension will not work.
- The function to explain whole files only works for small files, as the OpenAI API has a limit of 4000 tokens (approx. 3000 words) per request.

## Release Notes

### 1.0.0

Initial release of the Explain Code Extension

## Contributing

If you are interested in contributing to the development of this extension, please check out the [GitHub repository](https://github.com/eimenhmdt/explain-code-vs-extension)

## License

This extension is licensed under the MIT License.

**Enjoy!**
