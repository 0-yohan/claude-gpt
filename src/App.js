import React, { useState, useEffect } from "react";
import userAvatar from "./images/user-avatar.jpg";
import assistantAvatar from "./images/assistant-avatar.png";
import loadingSpinner from "./images/loading-spinner.gif";

const App = () => {
  const [value, setValue] = useState("");
  const [message, setMessage] = useState(null);
  const [previousChats, setPreviousChats] = useState([]);
  const [currentTitle, setCurrentTitle] = useState(null);
  const [loading, setLoading] = useState(false);

  const createNewChat = () => {
    setMessage(null);
    setValue("");
    setCurrentTitle(null);
  };

  const handleClick = (uniqueTitles) => {
    setCurrentTitle(uniqueTitles);
    setMessage(null);
    setValue("");
  };

  const getMessages = async () => {
    setLoading(true);
    const options = {
      method: "POST",
      body: JSON.stringify({
        messages: [
          ...previousChats, // Previous user and assistant messages
          { role: "user", content: value }, // The user's new input
        ],
      }),
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer YOUR_CLAUDE_AI_API_KEY",
      },
    };

    try {
      const response = await fetch(
        "https://api.claude.ai/beta/messages",
        options
      );
      const data = await response.json();

      // Assuming the API returns an array of messages in the response
      const aiMessages = data.choices;

      // Update state with the new AI messages
      setPreviousChats([...previousChats, ...aiMessages]);

      // Assuming you want to display only the last AI message
      const lastAiMessage = aiMessages[aiMessages.length - 1];
      setMessage({
        role: lastAiMessage.role,
        content: lastAiMessage.message,
      });
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!currentTitle && value && message) {
      setCurrentTitle(value);
    }
    if (currentTitle && value && message) {
      // Add user message with timestamp
      addChatMessage("user", value);
      // Add AI message(s) with timestamp
      addAiMessages(message);
    }
  }, [message, currentTitle]);

  const addChatMessage = (role, content) => {
    const now = new Date();
    const options = { hour: "numeric", minute: "numeric", hour12: true };
    const timestamp = now.toLocaleTimeString(undefined, options);
    setPreviousChats((prevChats) => [
      ...prevChats,
      {
        title: currentTitle,
        role,
        content,
        timestamp,
      },
    ]);
  };

  const addAiMessages = (aiMessage) => {
    // Assuming aiMessage is an object with role and message properties
    setPreviousChats((prevChats) => [...prevChats, aiMessage]);
  };

  const currentChat = previousChats.filter(
    (prevChat) => prevChat.title === currentTitle
  );
  const uniqueTitles = Array.from(
    new Set(previousChats.map((prevChat) => prevChat.title))
  );

  return (
    <div className="app">
      <div className="side-bar">
        <button onClick={createNewChat}> + New Chat</button>
        <ul className="history">
          {uniqueTitles?.map((uniqueTitle, index) => (
            <li key={index} onClick={() => handleClick(uniqueTitle)}>
              {uniqueTitle}
            </li>
          ))}
        </ul>
        <nav>
          <p>Made by Abdul Rahman</p>
        </nav>
      </div>
      <section className="main">
        {!currentTitle && <h1>SastaGPT</h1>}
        <ul className="feed">
          {currentChat?.map((chatMessage, index) => (
            <li key={index}>
              <div className="message">
                <img
                  className="avatar"
                  src={
                    chatMessage.role === "user"
                      ? userAvatar
                      : assistantAvatar
                  }
                  alt={chatMessage.role}
                />
                <p className="timestamp">{chatMessage.timestamp}</p>
              </div>
              <p>{chatMessage.content}</p>
            </li>
          ))}
        </ul>
        <div className="bottom-section">
          <div className="input-container">
            <input
              value={value}
              onChange={(e) => setValue(e.target.value)}
            />
            {loading && (
              <img
                className="loadingSpinner"
                src={loadingSpinner}
                alt="Loading"
              />
            )}
            <div id="submit" onClick={getMessages}>
              ➢
            </div>
          </div>
          <p className="info">Your Feedback is appreciated</p>
        </div>
      </section>
    </div>
  );
};

export default App;
