import { useEffect, useState } from 'react';

export default function App() {
  const [notifications, setNotifications] = useState([]);

  const API_URL = import.meta.env.VITE_API_BASE_URL;
  const WS_URL = import.meta.env.VITE_API_WS_URL;

  useEffect(() => {
    const ws = new WebSocket(WS_URL);

    ws.onmessage = (e) => {
      const data = JSON.parse(e.data);
      if (data.type === 'notification') {
        setNotifications((prev) => [data.data, ...prev.slice(0, 19)]);
      }
    };

    ws.onerror = (err) => {
      console.error('WebSocket error:', err);
    };

    ws.onclose = () => {
      console.log('WebSocket disconnected');
    };

    fetch(`${API_URL}/notifications/1`)
      .then((r) => r.json())
      .then(setNotifications)
      .catch((err) => console.error('Fetch error:', err));

    return () => ws.close();
  }, [API_URL, WS_URL]);

  const handleLike = async () => {
    try {
      await fetch(`${API_URL}/like`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: 2,
          postId: 1
        }),
      });
    } catch (err) {
      console.error('Like failed:', err);
    }
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1 className="app-title">Modern Villa Design</h1>
        <button onClick={handleLike} className="like-button">
          Like
        </button>
      </header>

      <div className="notification-badge">
        <span role="img" aria-label="bell">🔔</span>
        <sup>{notifications.length}</sup>
      </div>

      <h2>Notifications</h2>
      <ul className="notifications-list">
        {notifications.length === 0 ? (
          <li>No notifications yet</li>
        ) : (
          notifications.map((n, i) => (
            <li key={i}>{i + 1}: {n.message}</li>
          ))
        )}
      </ul>
    </div>
  );
}