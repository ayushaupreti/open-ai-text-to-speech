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
  InputNumber,
  Col,
  Row,
} from "antd";
import AudioPlayer from "react-h5-audio-player";

import { formats, models, voices } from "./utils/constants";
import {
  arrayToSelectOptions,
  calculateEstimatedUsage,
  fetchAudioFileBlob,
} from "./utils/helpers";

import "react-h5-audio-player/lib/styles.css";
import "./App.css";

const { TextArea } = Input;

const App = () => {
  const voiceOptions = arrayToSelectOptions(voices);
  const modelOptions = arrayToSelectOptions(models);
  const formatOptions = arrayToSelectOptions(formats);

  const [audioUrl, setAudioUrl] = useState();
  const [error, setError] = useState();
  const [fetchingAudio, setFetchingAudio] = useState(false);
  const [textLength, setTextLength] = useState();
  const [modelType, setModelType] = useState("");
  const [speed, setSpeed] = useState(1.0);

  const onSpeedChange = (newSpeed) => {
    setSpeed(newSpeed);
  };

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
        <h1>OpenAI Text to Speech API Playground</h1>
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
          labelCol={{ span: 8, offset: 0 }}
          onFinish={onFinish}
          layout="vertical"
          style={{ maxWidth: 900 }}
          // disabled={fetchingAudio}
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
              style={{ height: 300, resize: "none" }}
              count={{
                show: true,
                max: 4096,
              }}
              disabled={fetchingAudio}
            />
          </Form.Item>

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
              style={{ maxWidth: 500 }}
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
              style={{ maxWidth: 500 }}
              options={modelOptions}
              disabled={fetchingAudio}
            />
          </Form.Item>

          <Form.Item label="Format" name="format">
            <Select
              style={{ maxWidth: 500 }}
              options={formatOptions}
              disabled={fetchingAudio}
            />
          </Form.Item>

          <Form.Item label="Speed" name="speed">
            <Row>
              <Col span={16}>
                <Slider
                  value={speed}
                  min={0.25}
                  max={4.0}
                  step={0.01}
                  onChange={onSpeedChange}
                  disabled={fetchingAudio}
                />
              </Col>
              <Col span={4}>
                <InputNumber
                  min={0.25}
                  max={4.0}
                  style={{ margin: "0 16px" }}
                  value={speed}
                  onChange={onSpeedChange}
                  disabled={fetchingAudio}
                />
              </Col>
            </Row>
          </Form.Item>

          {!audioUrl && !error && (
            <Form.Item>
              <Button type="primary" htmlType="submit" loading={fetchingAudio}>
                Generate Audio File
              </Button>
            </Form.Item>
          )}
        </Form>

        {error && <Alert message={error} type="error" />}

        {audioUrl && (
          <AudioPlayer src={audioUrl} style={{ marginBottom: "30px" }} />
        )}

        <Space style={{ marginBottom: "20px" }}>
          {(audioUrl || error) && (
            <Button
              type="primary"
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
          <Row>
            <Col>
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
                <h3>
                  Estimated cost: $
                  {calculateEstimatedUsage(textLength, modelType)} USD
                </h3>
              </Tooltip>
            </Col>
          </Row>
        )}
      </div>
    </div>
  );
};

export default App;
