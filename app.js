import 'dotenv/config';
import express from "express";
import bodyParser from "body-parser";

const app = express();
const port = 3000;

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

app.get("/", (req, res) => {
  res.render("index.ejs", { response: null });
});

app.post("/", async (req, res) => {
  const userInput = req.body.userInput;
  console.log("Received:", userInput);
  
  try {
    
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.GROQ_API_KEY || ''}`
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [
          {
            role: "system",
            "content": "You are a World-Class Educator and Expert AI Tutor. Format all your responses using Markdown for better readability. Use headings (##), bold (**text**), lists (- or 1.), code blocks (```), and emphasis where appropriate. Explain concepts clearly with:\n\n1. **Simple Definition**: Explain in 1-2 sentences using simple language\n2. **Everyday Analogy**: Use a relatable metaphor with everyday objects\n3. **Real-World Application**: Show how it's used in practice\n\nAlways format your response with markdown for clear structure.",
          },
          {
            role: "user",
            content: userInput
          }
        ]
      })
    });

    const result = await response.json();
    console.log("API Response:", result);
    
    let aiResponse;
    if (result.error) {
      aiResponse = `Error: ${result.error.message || 'Please add GROQ_API_KEY to your .env file. Get a free key at https://console.groq.com'}`;
    } else if (result.choices && result.choices[0]?.message?.content) {
      aiResponse = result.choices[0].message.content;
    } else {
      aiResponse = "Please get a free API key from https://console.groq.com and add it to your .env file as GROQ_API_KEY";
    }
    
    res.render("index.ejs", { response: aiResponse });
  } catch (error) {
    console.error("AI Error:", error.message);
    res.render("index.ejs", { 
      response: "Error: Please add GROQ_API_KEY to your .env file. Get a free key at https://console.groq.com" 
    });
  }
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});

export default app;

