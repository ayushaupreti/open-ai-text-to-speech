# Context

While digging into OpenAI documentation, I noticed there was no playground for the [audio endpoints](https://platform.openai.com/docs/api-reference/audio). I was specifically working with the text to speech API and found it very difficult to test out the different options offered. 
I think it's extremely useful to have a UI for endpoints with audio that allow you to fidget around with the parameters.

## Details

This playground allows you to interact with the [create speech](https://platform.openai.com/docs/api-reference/audio/createSpeech) endpoint and adjust some parameters. It will then generate the audio file and allow you to preview it in the browser. You can then reset the options, or download the generated audio file.

## To do list

- specify filename when downloading
- add input box for speed

## Web app

This project is live at [speechtotextplayground.netlify.app](https://speechtotextplayground.netlify.app)
