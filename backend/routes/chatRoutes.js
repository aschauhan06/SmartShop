import express from "express";
import OpenAI from "openai";
import Product from "../models/productModel.js";

const router = express.Router();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Simple intent helper
const isProductQuery = (msg) => {
  const m = msg.toLowerCase();
  return ["laptop", "phone", "mobile", "shoes", "watch", "headphone"].some(k => m.includes(k));
};

router.post("/", async (req, res) => {
  try {
    const { message } = req.body;
    const msg = (message || "").toLowerCase();

    // 1) Greeting (fast rule)
    if (["hi", "hello", "hey"].some(g => msg.includes(g))) {
      return res.json({ reply: "Hi! Ask me about products, prices or deals 😊" });
    }

    // 2) Product-aware (DB)
    if (isProductQuery(msg)) {
      const products = await Product.find({ name: new RegExp(msg.split(" ")[0], "i") }).limit(3);

      if (products.length) {
        let reply = "Here are some options:\n";
        products.forEach(p => {
          reply += `👉 ${p.name} — ₹${p.price}\n`;
        });
        return res.json({ reply });
      }
      // if nothing found, fall through to AI
    }

    // 3) AI fallback
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "You are a helpful e-commerce assistant. Keep answers short." },
        { role: "user", content: message },
      ],
    });

    const reply = completion.choices?.[0]?.message?.content || "Sorry, I couldn’t answer that.";
    res.json({ reply });

  } catch (err) {
    console.error("Chat error:", err.message);
    res.status(500).json({ reply: "Server error. Try again." });
  }
});

export default router;