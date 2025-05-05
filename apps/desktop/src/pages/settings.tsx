import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "../components/ui/button";

interface ConfigSection {
  [key: string]: string | number | boolean;
}

interface Config {
  [section: string]: ConfigSection;
}

export function Settings() {
  const [config, setConfig] = useState<Config | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch("http://localhost:5400/config");
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      const data = await response.json();
      setConfig(data);
    } catch (err) {
      console.error("Error fetching config:", err);
      setError("Failed to load configuration. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const saveConfig = async () => {
    if (!config) return;
    
    setSaving(true);
    setError(null);
    setSuccess(null);
    
    try {
      const response = await fetch("http://localhost:5400/config", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(config),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      setSuccess("Configuration saved successfully!");
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccess(null);
      }, 3000);
    } catch (err) {
      console.error("Error saving config:", err);
      setError("Failed to save configuration. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (section: string, key: string, value: string | number | boolean) => {
    if (!config) return;
    
    // Determine the type of the original value and convert accordingly
    const originalValue = config[section][key];
    let typedValue: string | number | boolean = value;
    
    if (typeof originalValue === "number") {
      typedValue = Number(value);
    } else if (typeof originalValue === "boolean") {
      typedValue = value === "true";
    }
    
    setConfig({
      ...config,
      [section]: {
        ...config[section],
        [key]: typedValue,
      },
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (!config) {
    return (
      <div className="text-center p-8 bg-card rounded-lg border border-border">
        <p className="text-muted-foreground">No configuration found.</p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Settings</h1>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={fetchConfig} disabled={loading || saving}>
            Reset
          </Button>
          <Button onClick={saveConfig} disabled={loading || saving}>
            {saving ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </div>

      {error && (
        <div className="bg-destructive/10 text-destructive p-4 rounded-md">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-500/10 text-green-500 p-4 rounded-md">
          {success}
        </div>
      )}

      <div className="space-y-8">
        {Object.entries(config).map(([sectionName, section]) => (
          <div key={sectionName} className="bg-card rounded-lg border border-border p-6">
            <h2 className="text-xl font-semibold mb-4">{sectionName}</h2>
            <div className="space-y-4">
              {Object.entries(section).map(([key, value]) => (
                <div key={key} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                  <label htmlFor={`${sectionName}-${key}`} className="text-sm font-medium">
                    {key}
                  </label>
                  {typeof value === "boolean" ? (
                    <select
                      id={`${sectionName}-${key}`}
                      value={String(value)}
                      onChange={(e) => handleChange(sectionName, key, e.target.value)}
                      className="col-span-2 p-2 border border-input rounded-md bg-background"
                    >
                      <option value="true">True</option>
                      <option value="false">False</option>
                    </select>
                  ) : (
                    <input
                      id={`${sectionName}-${key}`}
                      type={typeof value === "number" ? "number" : "text"}
                      value={value}
                      onChange={(e) => handleChange(sectionName, key, e.target.value)}
                      className="col-span-2 p-2 border border-input rounded-md bg-background"
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}