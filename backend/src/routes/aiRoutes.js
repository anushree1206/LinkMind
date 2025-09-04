import express from "express";
import { GoogleGenerativeAI } from "@google/generative-ai";
import Contact from "../models/Contact.js";
import { authenticateToken } from "../middleware/auth.js";

const router = express.Router();

// Initialize Google's Generative AI
const genAI = process.env.GOOGLE_API_KEY ? new GoogleGenerativeAI(process.env.GOOGLE_API_KEY) : null;

router.get("/recommendations", authenticateToken, async (req, res) => {
  try {
    if (!genAI) {
      console.warn('Google API key not configured - returning fallback data')
      return res.json({
        success: true,
        data: {
          recommendations: [
            {
              title: "Configure AI Integration",
              description: "Please set up your Google API key to enable AI-powered insights.",
              impact: 'high',
              effort: 'low',
              category: "Setup"
            },
            {
              title: "Review Recent Contacts",
              description: "Check your recent contacts and follow up with those you haven't connected with in a while.",
              impact: 'medium',
              effort: 'medium',
              category: "Engagement"
            }
          ],
          quickTips: [
            { tip: "Set up your Google API key in the .env file to enable AI-powered insights", category: "Setup" },
            { tip: "Regularly update your contacts' information for better insights", category: "Best Practice" },
            { tip: "Try reaching out to at least 5 contacts this week", category: "Engagement" }
          ]
        }
      });
    }

    const userId = req.user._id; // Changed from req.user.id to req.user._id to match JWT payload

    // Fetch recent contacts with their interactions
    // Get contacts with either lastContacted or interactions
    const contacts = await Contact.aggregate([
      {
        $match: {
          user: new mongoose.Types.ObjectId(userId),
          $or: [
            { lastContacted: { $exists: true } },
            { 'interactions.0': { $exists: true } }
          ]
        }
      },
      {
        $lookup: {
          from: 'interactions',
          localField: '_id',
          foreignField: 'contact',
          as: 'interactions',
          pipeline: [
            { $sort: { date: -1 } },
            { $limit: 5 }
          ]
        }
      },
      { $sort: { lastContacted: -1 } },
      { $limit: 50 },
      {
        $project: {
          fullName: 1,
          lastContacted: 1,
          relationshipStrength: 1,
          notes: 1,
          tags: 1,
          jobTitle: 1,
          company: 1,
          interactions: 1
        }
      }
    ]);

    if (contacts.length === 0) {
      return res.json({
        success: true,
        data: {
          recommendations: [],
          quickTips: [
            {
              title: "Add more contacts",
              description: "Start by adding more contacts to get personalized recommendations",
              category: "Getting Started"
            }
          ]
        }
      });
    }

    // Convert contacts into plain text summary
    const history = contacts.map(c => {
      const lastContacted = c.lastContacted 
        ? new Date(c.lastContacted).toLocaleDateString() 
        : 'Never';
      return `Name: ${c.fullName}, Job: ${c.jobTitle || 'N/A'} at ${c.company || 'N/A'}, ` +
             `Last Contacted: ${lastContacted}, ` +
             `Relationship: ${c.relationshipStrength || 'Not set'}, ` +
             `Tags: ${c.tags?.join(', ') || 'None'}, ` +
             `Notes: ${c.notes?.substring(0, 100) || 'None'}`;
    }).join("\n");

    // Generate AI recommendations
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    const prompt = `
      You are a professional networking and relationship management assistant. 
      Analyze the following contact history and provide actionable insights:

      ${history}

      Generate:
      1. 3-4 specific, actionable recommendations to improve networking health
        - Each should have: title, detailed description, expected impact (high/medium/low), 
          required effort (high/medium/low), and category (e.g., "Follow-up", "New Connection")
      
      2. 3 quick tips for better relationship management
        - Each should be a short, actionable tip with a category

      Return a valid JSON object with this exact structure:
      {
        "recommendations": [
          {
            "title": "string",
            "description": "string",
            "impact": "high|medium|low",
            "effort": "high|medium|low",
            "category": "string"
          }
        ],
        "quickTips": [
          {
            "tip": "string",
            "category": "string"
          }
        ]
      }
    `;

    const result = await model.generateContent(prompt);
    const response = JSON.parse(result.response.text());

    // Validate response structure
    if (!response.recommendations || !response.quickTips) {
      throw new Error("Invalid response format from AI");
    }

    res.json({ 
      success: true, 
      data: response 
    });

  } catch (error) {
    console.error("Error in AI recommendations:", error);
    
    // Return fallback data on error
    res.json({
      success: true,
      data: {
        recommendations: [
          {
            title: "Error Loading AI Insights",
            description: "We encountered an error while generating AI insights. Our team has been notified.",
            impact: 'high',
            effort: 'low',
            category: "Error"
          },
          {
            title: "Try Refreshing",
            description: "Click the refresh button to try loading the insights again.",
            impact: 'medium',
            effort: 'low',
            category: "Troubleshooting"
          }
        ]
      }
    });
  }
});

export default router;
