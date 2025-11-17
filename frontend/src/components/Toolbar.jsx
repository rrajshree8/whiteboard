import { useState } from 'react';
import { 
  Pen, Eraser, Type, Square, Circle, Minus, 
  Undo2, Redo2, Trash2, Save, Download, Upload,
  Home, Copy, Check
} from 'lucide-react';
import { Button } from './ui/button';
import { Slider } from './ui/slider';
import { Separator } from './ui/separator';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../hooks/use-toast';

const Toolbar = ({
  tool,
  setTool,
  color,
  setColor,
  lineWidth,
  setLineWidth,
  undo,
  redo,
  clearCanvas,
  saveToLocalStorage,
  loadFromLocalStorage,
  exportImage,
  roomId
}) => {
  const [copied, setCopied] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const colors = [
    '#000000', '#FF0000', '#00FF00', '#0000FF', 
    '#FFFF00', '#FF00FF', '#00FFFF', '#FFA500',
    '#800080', '#008000', '#FFC0CB', '#A52A2A'
  ];

  const tools = [
    { id: 'pen', icon: Pen, label: 'Pen' },
    { id: 'eraser', icon: Eraser, label: 'Eraser' },
    { id: 'line', icon: Minus, label: 'Line' },
    { id: 'rectangle', icon: Square, label: 'Rectangle' },
    { id: 'circle', icon: Circle, label: 'Circle' },
    { id: 'text', icon: Type, label: 'Text' }
  ];

  const copyRoomId = () => {
    navigator.clipboard.writeText(roomId);
    setCopied(true);
    toast({
      title: 'Copied!',
      description: 'Room ID copied to clipboard',
    });
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50">
      <div className="bg-white/95 dark:bg-slate-800/90 backdrop-blur-lg shadow-2xl rounded-2xl p-3 border border-slate-200 dark:border-slate-700">
        <div className="flex items-center gap-3">
          {/* Home */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/')}
            className="hover:bg-indigo-50 dark:hover:bg-slate-700 transition-colors"
          >
            <Home className="w-5 h-5" />
          </Button>

          <Separator orientation="vertical" className="h-8" />

          {/* Tools */}
          <div className="flex gap-1">
            {tools.map(({ id, icon: Icon, label }) => (
              <Button
                key={id}
                variant={tool === id ? 'default' : 'ghost'}
                size="icon"
                onClick={() => setTool(id)}
                className={`transition-all ${
                  tool === id 
                    ? 'bg-gradient-to-br from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700' 
                    : 'hover:bg-slate-100 dark:hover:bg-slate-700'
                }`}
                title={label}
              >
                <Icon className="w-5 h-5" />
              </Button>
            ))}
          </div>

          <Separator orientation="vertical" className="h-8" />

          {/* Colors */}
          <div className="flex gap-1">
            {colors.map((c) => (
              <button
                key={c}
                onClick={() => setColor(c)}
                className={`w-7 h-7 rounded-full transition-all hover:scale-110 ${
                  color === c ? 'ring-2 ring-offset-2 ring-indigo-500 dark:ring-offset-slate-800' : ''
                }`}
                style={{ backgroundColor: c }}
                title={c}
              />
            ))}
            <input
              type="color"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              className="w-7 h-7 rounded-full cursor-pointer"
              title="Custom color"
            />
          </div>

          <Separator orientation="vertical" className="h-8" />

          {/* Line Width */}
          <div className="w-32 px-2">
            <Slider
              value={[lineWidth]}
              onValueChange={(value) => setLineWidth(value[0])}
              min={1}
              max={20}
              step={1}
              className="cursor-pointer"
            />
            <div className="text-xs text-center text-slate-600 mt-1">{lineWidth}px</div>
          </div>

          <Separator orientation="vertical" className="h-8" />

          {/* Actions */}
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={undo}
              className="hover:bg-slate-100 dark:hover:bg-slate-700"
              title="Undo"
            >
              <Undo2 className="w-5 h-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={redo}
              className="hover:bg-slate-100 dark:hover:bg-slate-700"
              title="Redo"
            >
              <Redo2 className="w-5 h-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={clearCanvas}
              className="hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/40"
              title="Clear canvas"
            >
              <Trash2 className="w-5 h-5" />
            </Button>
          </div>

          <Separator orientation="vertical" className="h-8" />

          {/* Storage */}
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={saveToLocalStorage}
              className="hover:bg-green-50 hover:text-green-600 dark:hover:bg-emerald-900/40"
              title="Save to browser"
            >
              <Save className="w-5 h-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={loadFromLocalStorage}
              className="hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-blue-900/40"
              title="Load from browser"
            >
              <Upload className="w-5 h-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={exportImage}
              className="hover:bg-purple-50 hover:text-purple-600 dark:hover:bg-purple-900/40"
              title="Export as PNG"
            >
              <Download className="w-5 h-5" />
            </Button>
          </div>

          <Separator orientation="vertical" className="h-8" />

          {/* Room ID */}
          <Button
            variant="outline"
            size="sm"
            onClick={copyRoomId}
            className="hover:bg-indigo-50 hover:border-indigo-300 dark:hover:bg-slate-700"
          >
            {copied ? <Check className="w-4 h-4 mr-2" /> : <Copy className="w-4 h-4 mr-2" />}
            {roomId}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Toolbar;
