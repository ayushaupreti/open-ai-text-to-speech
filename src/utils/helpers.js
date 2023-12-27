import axios from "axios";

// helper method to convert array of constants into options that AntD Select can consume
export const arrayToSelectOptions = (valueArray) => {
  let options = [];
  valueArray.forEach((v) => {
    options.push({ value: v, label: v });
  });
  return options;
};

// helper method to make POST request to OpenAI text to speech endpoint
// current documentation can be found here: https://platform.openai.com/docs/api-reference/audio/createSpeech
export const fetchAudioFileBlob = async (
  model,
  text,
  voice,
  format,
  speed,
  apiKey
) => {
  const headers = {
    Authorization: `Bearer ${apiKey}`,
    "Content-Type": "application/json",
  };

  const data = {
    model: model,
    input: text,
    voice: voice,
    response_format: format,
    speed: speed,
  };

  try {
    const response = await axios.post(
      "https://api.openai.com/v1/audio/speech",
      data,
      { headers, responseType: "blob" }
    );
    return { type: "success", data: response.data };
  } catch (error) {
    return { type: "error", data: error.message };
  }
};

// helper method to calculate estimated cost for each request
// TTS: $0.015 / 1K characters
// TTS HD: $0.030 / 1K characters
// current pricing details can be found here: https://openai.com/pricing
export const calculateEstimatedUsage = (characters, model) => {
  switch (model) {
    case "tts-1":
      return ((0.015 * characters) / 1000).toFixed(3);
    case "tts-1-hd":
      return ((0.03 * characters) / 1000).toFixed(3);
    default:
      return 0;
  }
};
