import { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { io } from 'socket.io-client';
import Toolbar from '../components/Toolbar';
import { useToast } from '../hooks/use-toast';
import { Toaster } from '../components/ui/toaster';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8001';

const Whiteboard = () => {
  const { roomId } = useParams();
  const canvasRef = useRef(null);
  const socketRef = useRef(null);
  const { toast } = useToast();
  
  const [isDrawing, setIsDrawing] = useState(false);
  const [tool, setTool] = useState('pen');
  const [color, setColor] = useState('#000000');
  const [lineWidth, setLineWidth] = useState(2);
  const [history, setHistory] = useState([]);
  const [historyStep, setHistoryStep] = useState(0);
  const [textInput, setTextInput] = useState({ active: false, x: 0, y: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    
    const ctx = canvas.getContext('2d');
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    
    // Save initial state
    saveState();

    // Connect to WebSocket
    socketRef.current = io(BACKEND_URL);
    
    socketRef.current.on('connect', () => {
      socketRef.current.emit('join-room', roomId);
      toast({
        title: 'Connected',
        description: `Room ID: ${roomId}`,
      });
    });

    socketRef.current.on('load-canvas', (drawingData) => {
      drawingData.forEach(data => drawOnCanvas(data, false));
    });

    socketRef.current.on('draw', (data) => {
      drawOnCanvas(data, false);
    });

    socketRef.current.on('clear-canvas', () => {
      clearCanvas(false);
    });

    return () => {
      socketRef.current?.disconnect();
    };
  }, [roomId]);

  const saveState = () => {
    const canvas = canvasRef.current;
    const newHistory = history.slice(0, historyStep + 1);
    newHistory.push(canvas.toDataURL());
    setHistory(newHistory);
    setHistoryStep(newHistory.length - 1);
  };

  const undo = () => {
    if (historyStep > 0) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      const img = new Image();
      img.src = history[historyStep - 1];
      img.onload = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0);
      };
      setHistoryStep(historyStep - 1);
    }
  };

  const redo = () => {
    if (historyStep < history.length - 1) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      const img = new Image();
      img.src = history[historyStep + 1];
      img.onload = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0);
      };
      setHistoryStep(historyStep + 1);
    }
  };

  const drawOnCanvas = (data, emit = true) => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    if (data.tool === 'clear') {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      return;
    }

    if (data.tool === 'text') {
      ctx.font = `${data.lineWidth * 8}px Inter, sans-serif`;
      ctx.fillStyle = data.color;
      ctx.fillText(data.text, data.x, data.y);
      return;
    }

    ctx.strokeStyle = data.color;
    ctx.lineWidth = data.lineWidth;
    ctx.globalCompositeOperation = data.tool === 'eraser' ? 'destination-out' : 'source-over';

    if (data.tool === 'line' || data.tool === 'rectangle' || data.tool === 'circle') {
      if (data.tool === 'line') {
        ctx.beginPath();
        ctx.moveTo(data.startX, data.startY);
        ctx.lineTo(data.endX, data.endY);
        ctx.stroke();
      } else if (data.tool === 'rectangle') {
        ctx.strokeRect(data.startX, data.startY, data.endX - data.startX, data.endY - data.startY);
      } else if (data.tool === 'circle') {
        const radius = Math.sqrt(Math.pow(data.endX - data.startX, 2) + Math.pow(data.endY - data.startY, 2));
        ctx.beginPath();
        ctx.arc(data.startX, data.startY, radius, 0, 2 * Math.PI);
        ctx.stroke();
      }
    } else {
      ctx.beginPath();
      ctx.moveTo(data.x0, data.y0);
      ctx.lineTo(data.x1, data.y1);
      ctx.stroke();
    }

    if (emit) {
      socketRef.current?.emit('draw', {
        roomId,
        drawData: data
      });
    }
  };

  const startDrawing = (e) => {
    // Don't start drawing if text input is already active
    if (textInput.active) {
      return;
    }

    if (tool === 'text') {
      // Prevent event propagation to avoid conflicts
      e.preventDefault();
      e.stopPropagation();
      const rect = canvasRef.current.getBoundingClientRect();
      setTextInput({ active: true, x: e.clientX - rect.left, y: e.clientY - rect.top });
      return;
    }

    setIsDrawing(true);
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    canvas.dataset.startX = x;
    canvas.dataset.startY = y;
    canvas.dataset.lastX = x;
    canvas.dataset.lastY = y;
  };

  const draw = (e) => {
    if (!isDrawing) return;
    
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (tool === 'pen' || tool === 'eraser') {
      const drawData = {
        tool,
        x0: parseFloat(canvas.dataset.lastX),
        y0: parseFloat(canvas.dataset.lastY),
        x1: x,
        y1: y,
        color,
        lineWidth: tool === 'eraser' ? lineWidth * 3 : lineWidth
      };
      
      drawOnCanvas(drawData);
      canvas.dataset.lastX = x;
      canvas.dataset.lastY = y;
    }
  };

  const stopDrawing = (e) => {
    if (!isDrawing) return;
    
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const endX = e.clientX - rect.left;
    const endY = e.clientY - rect.top;
    const startX = parseFloat(canvas.dataset.startX);
    const startY = parseFloat(canvas.dataset.startY);

    if (tool === 'line' || tool === 'rectangle' || tool === 'circle') {
      const drawData = {
        tool,
        startX,
        startY,
        endX,
        endY,
        color,
        lineWidth
      };
      drawOnCanvas(drawData);
    }

    setIsDrawing(false);
    saveState();
  };

  const handleTextSubmit = (text) => {
    if (!textInput.active) return; // Prevent double submission
    
    if (text && text.trim()) {
      const drawData = {
        tool: 'text',
        text: text.trim(),
        x: textInput.x,
        y: textInput.y,
        color,
        lineWidth
      };
      drawOnCanvas(drawData);
      saveState();
    }
    setTextInput({ active: false, x: 0, y: 0 });
  };

  const clearCanvas = (emit = true) => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    saveState();
    
    if (emit) {
      socketRef.current?.emit('clear-canvas', roomId);
    }
  };

  const saveToLocalStorage = () => {
    const canvas = canvasRef.current;
    const imageData = canvas.toDataURL();
    localStorage.setItem(`whiteboard_${roomId}`, imageData);
    toast({
      title: 'Saved!',
      description: 'Board saved to browser storage',
    });
  };

  const loadFromLocalStorage = () => {
    const imageData = localStorage.getItem(`whiteboard_${roomId}`);
    if (imageData) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      const img = new Image();
      img.src = imageData;
      img.onload = () => {
        ctx.drawImage(img, 0, 0);
        saveState();
      };
      toast({
        title: 'Loaded!',
        description: 'Board loaded from browser storage',
      });
    }
  };

  const exportImage = () => {
    const canvas = canvasRef.current;
    const link = document.createElement('a');
    link.download = `whiteboard_${roomId}.png`;
    link.href = canvas.toDataURL();
    link.click();
    toast({
      title: 'Exported!',
      description: 'Image downloaded successfully',
    });
  };

  const canvasClassName = tool === 'text' ? 'text-mode' : tool === 'eraser' ? 'eraser-mode' : '';

  return (
    <div className="canvas-container">
      <canvas
        ref={canvasRef}
        onMouseDown={startDrawing}
        onMouseMove={draw}
        onMouseUp={stopDrawing}
        onMouseLeave={stopDrawing}
        className={canvasClassName}
      />
      
      <Toolbar
        tool={tool}
        setTool={setTool}
        color={color}
        setColor={setColor}
        lineWidth={lineWidth}
        setLineWidth={setLineWidth}
        undo={undo}
        redo={redo}
        clearCanvas={clearCanvas}
        saveToLocalStorage={saveToLocalStorage}
        loadFromLocalStorage={loadFromLocalStorage}
        exportImage={exportImage}
        roomId={roomId}
      />

      {textInput.active && (
        <div
          style={{
            position: 'absolute',
            left: textInput.x,
            top: textInput.y,
            zIndex: 1000
          }}
          onClick={(e) => e.stopPropagation()}
          onMouseDown={(e) => e.stopPropagation()}
        >
          <input
            autoFocus
            type="text"
            className="border-2 border-indigo-500 px-2 py-1 rounded bg-white"
            style={{ fontSize: `${lineWidth * 8}px`, minWidth: '200px' }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleTextSubmit(e.target.value);
              } else if (e.key === 'Escape') {
                e.preventDefault();
                setTextInput({ active: false, x: 0, y: 0 });
              }
            }}
            onBlur={(e) => {
              // Small delay to allow Enter key to process first
              const value = e.target.value;
              setTimeout(() => {
                if (textInput.active) {
                  handleTextSubmit(value);
                }
              }, 100);
            }}
            onClick={(e) => e.stopPropagation()}
            onMouseDown={(e) => e.stopPropagation()}
          />
        </div>
      )}
      
      <Toaster />
    </div>
  );
};

export default Whiteboard;
