import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Palette, Users, Download, Undo, Type, Pencil } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';

const Home = () => {
  const [roomId, setRoomId] = useState('');
  const navigate = useNavigate();

  const generateRoomId = () => {
    return Math.random().toString(36).substring(2, 10);
  };

  const createRoom = () => {
    const newRoomId = generateRoomId();
    navigate(`/board/${newRoomId}`);
  };

  const joinRoom = () => {
    if (roomId.trim()) {
      navigate(`/board/${roomId}`);
    }
  };

  const features = [
    { icon: Pencil, title: 'Drawing Tools', desc: 'Pen, brush, shapes & more' },
    { icon: Palette, title: 'Colors & Sizes', desc: 'Customize your strokes' },
    { icon: Type, title: 'Text Tool', desc: 'Add text annotations' },
    { icon: Undo, title: 'Undo/Redo', desc: 'Never lose your work' },
    { icon: Users, title: 'Real-time Sync', desc: 'Collaborate instantly' },
    { icon: Download, title: 'Export', desc: 'Save as PNG image' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-12 animate-fade-in">
          <h1 className="text-6xl font-bold mb-4 bg-gradient-to-r from-indigo-600 to-blue-600 bg-clip-text text-transparent">
            Collaborative Whiteboard
          </h1>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto">
            Draw, sketch, and brainstorm together in real-time. Create or join a room to get started.
          </p>
        </div>

        <div className="max-w-md mx-auto mb-16">
          <Card className="shadow-xl border-0 bg-white/80 backdrop-blur">
            <CardHeader>
              <CardTitle className="text-2xl">Get Started</CardTitle>
              <CardDescription>Create a new board or join an existing one</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button 
                onClick={createRoom} 
                className="w-full h-12 text-lg bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 transition-all duration-300 shadow-lg hover:shadow-xl"
              >
                Create New Board
              </Button>
              
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-slate-300" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white px-2 text-slate-500">Or join existing</span>
                </div>
              </div>

              <div className="flex gap-2">
                <Input
                  placeholder="Enter room ID"
                  value={roomId}
                  onChange={(e) => setRoomId(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && joinRoom()}
                  className="h-12"
                />
                <Button 
                  onClick={joinRoom} 
                  variant="outline" 
                  className="h-12 px-6 hover:bg-indigo-50 hover:border-indigo-300 transition-all"
                >
                  Join
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <Card 
                key={index} 
                className="border-0 bg-white/70 backdrop-blur hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
              >
                <CardContent className="pt-6">
                  <div className="flex items-start gap-4">
                    <div className="p-3 rounded-lg bg-gradient-to-br from-indigo-100 to-blue-100">
                      <Icon className="w-6 h-6 text-indigo-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg mb-1">{feature.title}</h3>
                      <p className="text-sm text-slate-600">{feature.desc}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Home;
