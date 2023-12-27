import React, { useState } from "react";
import {
  Button,
  Form,
  Input,
  Slider,
  Select,
  Alert,
  Space,
  Tooltip,
} from "antd";
import AudioPlayer from "react-h5-audio-player";
import axios from "axios";

import { formats, models, voices } from "./constants";
import "react-h5-audio-player/lib/styles.css";
import "./App.css";

const { TextArea } = Input;

// method to convert array of constants into options that AntD Select can consume
const arrayToSelectOptions = (valueArray) => {
  let options = [];
  valueArray.forEach((v) => {
    options.push({ value: v, label: v });
  });
  return options;
};

// method to make POST request to OpenAI endpoint
const fetchAudioFileBlob = async (
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

// TTS: $0.015 / 1K characters
// TTS HD: $0.030 / 1K characters
const calculateEstimatedUsage = (characters, model) => {
  switch (model) {
    case "tts-1":
      return ((0.015 * characters) / 1000).toFixed(3);
    case "tts-1-hd":
      return ((0.03 * characters) / 1000).toFixed(3);
    default:
      return 0;
  }
};

const App = () => {
  const voiceOptions = arrayToSelectOptions(voices);
  const modelOptions = arrayToSelectOptions(models);
  const formatOptions = arrayToSelectOptions(formats);

  const [audioUrl, setAudioUrl] = useState();
  const [error, setError] = useState();
  const [fetchingAudio, setFetchingAudio] = useState(false);
  const [textLength, setTextLength] = useState();
  const [modelType, setModelType] = useState("");

  const onFinish = async (values) => {
    const model = values.model;
    const text = values.text;
    const voice = values.voice;
    const format = values.format;
    const speed = values.speed;
    const apiKey = values.apiKey;

    setTextLength(text.length);
    setModelType(model);

    setFetchingAudio(true);
    const response = await fetchAudioFileBlob(
      model,
      text,
      voice,
      format,
      speed,
      apiKey
    );
    setFetchingAudio(false);
    if (response.type === "success") {
      const url = URL.createObjectURL(response.data);
      setAudioUrl(url);
    } else {
      setError(`Error fetching audio: ${response.data}`);
    }
  };

  return (
    <div className="App">
      <div className="container">
        <h1 style={{ marginTop: 0 }}>OpenAI Text to Speech API</h1>
        <p>
          Interact with the OpenAI text to speech endpoint. You can find
          documentation{" "}
          <a
            href="https://platform.openai.com/docs/api-reference/audio/createSpeech"
            target="_blank"
            rel="noopener noreferrer"
          >
            {" "}
            here
          </a>
        </p>
        <Form
          initialValues={{
            voice: voiceOptions[0].label,
            model: modelOptions[0].label,
            format: formatOptions[0].label,
            speed: 1.0,
          }}
          onFinish={onFinish}
        >
          <Form.Item
            label="API Key"
            name="apiKey"
            rules={[
              {
                required: true,
                message: "Please input your API key!",
              },
            ]}
          >
            <Input disabled={fetchingAudio} />
          </Form.Item>

          <Form.Item
            label="Text"
            name="text"
            rules={[
              {
                required: true,
                message: "Please input some text to convert!",
              },
            ]}
            style={{ marginBottom: "40px" }}
          >
            <TextArea
              rows={8}
              count={{
                show: true,
                max: 4096,
              }}
              disabled={fetchingAudio}
            />
          </Form.Item>

          <Space size="large">
            <Form.Item
              label="Voice"
              name="voice"
              rules={[
                {
                  required: true,
                  message: "Please select a voice!",
                },
              ]}
            >
              <Select
                style={{ width: 150 }}
                options={voiceOptions}
                disabled={fetchingAudio}
              />
            </Form.Item>

            <Form.Item
              label="Model"
              name="model"
              rules={[
                {
                  required: true,
                  message: "Please select a model!",
                },
              ]}
            >
              <Select
                style={{ width: 150 }}
                options={modelOptions}
                disabled={fetchingAudio}
              />
            </Form.Item>

            <Form.Item label="Format" name="format">
              <Select
                style={{ width: 150 }}
                options={formatOptions}
                disabled={fetchingAudio}
              />
            </Form.Item>
          </Space>

          <Form.Item label="Speed" name="speed">
            <Slider min={0.25} max={4.0} step={0.01} disabled={fetchingAudio} />
          </Form.Item>

          {!audioUrl && !error && (
            <Form.Item wrapperCol={{ span: 8, offset: 10 }}>
              <Button type="primary" htmlType="submit" loading={fetchingAudio}>
                Generate Audio File
              </Button>
            </Form.Item>
          )}
        </Form>

        {error && <Alert message={error} type="error" />}

        {audioUrl && <AudioPlayer src={audioUrl} style={{ width: "75%" }} />}

        <Space>
          {(audioUrl || error) && (
            <Button
              type="link"
              onClick={() => {
                setAudioUrl();
                setError();
              }}
            >
              Reset
            </Button>
          )}

          {audioUrl && (
            <Button type="link" href={audioUrl} target="_blank" download>
              Download Audio File
            </Button>
          )}
        </Space>

        {audioUrl && (
          <Tooltip
            title={
              <>
                Find pricing information{" "}
                <a
                  href="https://openai.com/pricing"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  here
                </a>
              </>
            }
            placement="bottom"
          >
            Estimated cost: ${calculateEstimatedUsage(textLength, modelType)}{" "}
            USD
          </Tooltip>
        )}
      </div>
    </div>
  );
};

export default App;
