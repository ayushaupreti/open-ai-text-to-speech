import React, { useState } from "react";
import { Button, Form, Input, Slider, Select, Alert, Space } from "antd";
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
    return response.data;
  } catch (error) {
    return null;
  }
};

const App = () => {
  const voiceOptions = arrayToSelectOptions(voices);
  const modelOptions = arrayToSelectOptions(models);
  const formatOptions = arrayToSelectOptions(formats);

  const [audioUrl, setAudioUrl] = useState();
  const [error, setError] = useState();
  const [fetchingAudio, setFetchingAudio] = useState(false);

  const onFinish = async (values) => {
    const model = values.model;
    const text = values.text;
    const voice = values.voice;
    const format = values.format;
    const speed = values.speed;
    const apiKey = values.apiKey;

    setFetchingAudio(true);
    const speechData = await fetchAudioFileBlob(
      model,
      text,
      voice,
      format,
      speed,
      apiKey
    );
    setFetchingAudio(false);
    if (speechData) {
      const url = URL.createObjectURL(speechData);
      setAudioUrl(url);
      // const link = document.createElement("a");
      // link.href = url;
      // link.setAttribute("download", "speech.mp3");
      // document.body.appendChild(link);
      // link.click();
    } else {
      setError("Error fetching audio");
    }
  };

  return (
    <div className="App">
      <div className="container">
        <h1 style={{ marginTop: 0 }}>OpenAI Text to Speech API</h1>
        <p>
          Interact with the OpenAI endpoint for creating speech from text. You
          can find documentation{" "}
          <a href="https://platform.openai.com/docs/api-reference/audio/createSpeech">
            {" "}
            here
          </a>
        </p>
        <Form
          initialValues={{
            voice: voiceOptions[0].label,
            model: modelOptions[0].label,
            format: formatOptions[0].label,
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
            <Input />
          </Form.Item>

          <Form.Item
            label="Text"
            name="text"
            rules={[
              {
                required: true,
                message: "Please input the text you wish to get speech for!",
              },
            ]}
          >
            <TextArea rows={8} />
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
              <Select style={{ width: 150 }} options={voiceOptions} />
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
              <Select style={{ width: 150 }} options={modelOptions} />
            </Form.Item>

            <Form.Item
              label="Format"
              name="format"
              rules={[
                {
                  required: true,
                  message: "Please select a format!",
                },
              ]}
            >
              <Select style={{ width: 150 }} options={formatOptions} />
            </Form.Item>
          </Space>

          <Form.Item label="Speed" name="speed">
            <Slider defaultValue={1.0} min={0.25} max={4.0} step={0.01} />
          </Form.Item>

          {!audioUrl && !error && (
            <Form.Item wrapperCol={{ span: 8, offset: 10 }}>
              <Button type="primary" htmlType="submit" loading={fetchingAudio}>
                Generate Speech
              </Button>
            </Form.Item>
          )}
        </Form>
        {error && <Alert message={error} type="error" />}
        {audioUrl && <AudioPlayer src={audioUrl} style={{ width: "75%" }} />}
        {(audioUrl || error) && (
          <Space>
            <Button
              type="link"
              onClick={() => {
                setAudioUrl();
                setError();
              }}
            >
              Reset
            </Button>

            <Button type="link" href={audioUrl} target="_blank" download>
              Download Audio File
            </Button>
          </Space>
        )}
      </div>
    </div>
  );
};

export default App;
