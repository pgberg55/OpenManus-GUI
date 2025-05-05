import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "../components/ui/button";

export function RunTask() {
  const [prompt, setPrompt] = useState("");
  const [output, setOutput] = useState<string[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const outputRef = useRef<HTMLDivElement>(null);
  const [socket, setSocket] = useState<WebSocket | null>(null);

  useEffect(() => {
    // Scroll to bottom when output changes
    if (outputRef.current) {
      outputRef.current.scrollTop = outputRef.current.scrollHeight;
    }
  }, [output]);

  useEffect(() => {
    // Clean up WebSocket connection on unmount
    return () => {
      if (socket) {
        socket.close();
      }
    };
  }, [socket]);

  const runTask = async () => {
    if (!prompt.trim() || isRunning) return;

    setIsRunning(true);
    setOutput([]);

    try {
      // Create WebSocket connection
      const ws = new WebSocket("ws://localhost:5400/ws/run");
      setSocket(ws);

      ws.onopen = () => {
        ws.send(JSON.stringify({ prompt }));
      };

      ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        if (data.type === "output") {
          setOutput((prev) => [...prev, data.content]);
        } else if (data.type === "complete") {
          setIsRunning(false);
          ws.close();
        }
      };

      ws.onerror = (error) => {
        console.error("WebSocket error:", error);
        setOutput((prev) => [...prev, "Error: WebSocket connection failed"]);
        setIsRunning(false);
      };

      ws.onclose = () => {
        setSocket(null);
      };
    } catch (error) {
      console.error("Error running task:", error);
      setOutput((prev) => [...prev, `Error: ${error}`]);
      setIsRunning(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(output.join("\n"));
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <h1 className="text-3xl font-bold">Run Task</h1>
      
      <div className="space-y-4">
        <div>
          <label htmlFor="prompt" className="block text-sm font-medium mb-2">
            Prompt
          </label>
          <textarea
            id="prompt"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            className="w-full h-32 p-3 border border-input rounded-md bg-background"
            placeholder="Enter your task prompt here..."
            disabled={isRunning}
          />
        </div>
        
        <div className="flex space-x-2">
          <Button onClick={runTask} disabled={isRunning || !prompt.trim()}>
            {isRunning ? "Running..." : "Run Task"}
          </Button>
          <Button
            variant="outline"
            onClick={copyToClipboard}
            disabled={output.length === 0}
          >
            Copy Output
          </Button>
        </div>
        
        <div className="mt-6">
          <h2 className="text-xl font-semibold mb-2">Output</h2>
          <div
            ref={outputRef}
            className="bg-card border border-border rounded-md p-4 h-96 overflow-y-auto font-mono text-sm whitespace-pre-wrap"
          >
            {output.length > 0 ? (
              output.map((line, i) => <div key={i}>{line}</div>)
            ) : (
              <div className="text-muted-foreground">
                Task output will appear here...
              </div>
            )}
            {isRunning && (
              <div className="animate-pulse text-primary">▋</div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}