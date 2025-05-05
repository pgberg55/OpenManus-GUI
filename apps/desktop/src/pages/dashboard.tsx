import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "../components/ui/button";
import { useNavigate } from "react-router-dom";

interface Task {
  id: string;
  prompt: string;
  status: "completed" | "failed" | "running";
  created_at: string;
  updated_at: string;
}

export function Dashboard() {
  const [recentTasks, setRecentTasks] = useState<Task[]>([]);
  const [apiStatus, setApiStatus] = useState<"online" | "offline" | "checking">("checking");
  const [config, setConfig] = useState<any>(null);
  const navigate = useNavigate();

  useEffect(() => {
    checkApiStatus();
    fetchRecentTasks();
    fetchConfig();
  }, []);

  const checkApiStatus = async () => {
    try {
      const response = await fetch("http://localhost:5400/");
      setApiStatus(response.ok ? "online" : "offline");
    } catch (error) {
      setApiStatus("offline");
    }
  };

  const fetchRecentTasks = async () => {
    try {
      const response = await fetch("http://localhost:5400/history");
      if (response.ok) {
        const data = await response.json();
        setRecentTasks(data.slice(0, 3)); // Get only the 3 most recent tasks
      }
    } catch (error) {
      console.error("Error fetching recent tasks:", error);
    }
  };

  const fetchConfig = async () => {
    try {
      const response = await fetch("http://localhost:5400/config");
      if (response.ok) {
        const data = await response.json();
        setConfig(data);
      }
    } catch (error) {
      console.error("Error fetching config:", error);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "text-green-500 bg-green-50 dark:bg-green-900/20";
      case "failed":
        return "text-red-500 bg-red-50 dark:bg-red-900/20";
      case "running":
        return "text-blue-500 bg-blue-50 dark:bg-blue-900/20";
      default:
        return "text-gray-500 bg-gray-50 dark:bg-gray-900/20";
    }
  };

  const quickActions = [
    { name: "New Task", action: () => navigate("/run") },
    { name: "View History", action: () => navigate("/history") },
    { name: "Edit Settings", action: () => navigate("/settings") },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <h1 className="text-3xl font-bold">Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Recent Tasks */}
        <div className="bg-card p-6 rounded-lg shadow-sm border border-border">
          <h2 className="text-xl font-semibold mb-4">Recent Tasks</h2>
          {recentTasks.length > 0 ? (
            <div className="space-y-3">
              {recentTasks.map((task) => (
                <div key={task.id} className="p-3 bg-background rounded-md border border-border">
                  <div className="flex justify-between items-start">
                    <div className="truncate max-w-[200px]">{task.prompt}</div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(task.status)}`}>
                      {task.status}
                    </span>
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {formatDate(task.created_at)}
                  </div>
                </div>
              ))}
              <Button variant="outline" size="sm" className="w-full mt-2" onClick={() => navigate("/history")}>
                View All
              </Button>
            </div>
          ) : (
            <div className="text-center p-4 text-muted-foreground">
              No recent tasks found
            </div>
          )}
        </div>
        
        {/* Quick Actions */}
        <div className="bg-card p-6 rounded-lg shadow-sm border border-border">
          <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
          <div className="space-y-3">
            {quickActions.map((action, index) => (
              <Button 
                key={index} 
                variant="outline" 
                className="w-full justify-start text-left" 
                onClick={action.action}
              >
                {action.name}
              </Button>
            ))}
          </div>
        </div>
        
        {/* System Status */}
        <div className="bg-card p-6 rounded-lg shadow-sm border border-border">
          <h2 className="text-xl font-semibold mb-4">System Status</h2>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span>API Service</span>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                apiStatus === "online" 
                  ? "text-green-500 bg-green-50 dark:bg-green-900/20" 
                  : apiStatus === "checking"
                  ? "text-yellow-500 bg-yellow-50 dark:bg-yellow-900/20"
                  : "text-red-500 bg-red-50 dark:bg-red-900/20"
              }`}>
                {apiStatus}
              </span>
            </div>
            
            {config && (
              <div className="mt-4 pt-4 border-t border-border">
                <h3 className="text-sm font-medium mb-2">Configuration</h3>
                <div className="space-y-2 text-sm">
                  {Object.entries(config).map(([section, values]: [string, any]) => (
                    <div key={section}>
                      <div className="font-medium">{section}</div>
                      <div className="pl-2 text-muted-foreground">
                        {Object.entries(values).slice(0, 2).map(([key, value]: [string, any]) => (
                          <div key={key} className="flex justify-between">
                            <span>{key}:</span>
                            <span>{String(value)}</span>
                          </div>
                        ))}
                        {Object.keys(values).length > 2 && (
                          <div className="text-xs italic">
                            +{Object.keys(values).length - 2} more settings
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full mt-2" 
                  onClick={() => navigate("/settings")}
                >
                  Edit Configuration
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}