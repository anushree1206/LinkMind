import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GOOGLE_API_KEY!);

export async function GET() {
  try {
    // 🔹 Replace this mock with DB query later
    const lastInteractions = [
      "Hey, how have you been?",
      "Sorry for the late reply, been busy with work.",
      "Let's catch up sometime next week!",
      "Haven't heard from you in a while, everything okay?",
      "Thanks for helping me out yesterday!"
    ];

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `
    Based on these past interactions:
    ${lastInteractions.join("\n")}
    
    Give 3 relationship management tips (short sentences).
    Classify each tip as: Best Practice, Engagement, or Networking.
    Respond in JSON format like:
    [
      { "tip": "text", "category": "Best Practice" },
      { "tip": "text", "category": "Engagement" }
    ]
    `;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();

    let tips;
    try {
      tips = JSON.parse(responseText);
    } catch {
      tips = [
        { tip: "Keep engaging with your contacts regularly.", category: "Engagement" },
        { tip: "Balance personal and professional communication.", category: "Best Practice" },
        { tip: "Follow up quickly after meetings.", category: "Networking" }
      ];
    }

    return NextResponse.json({ tips });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to load AI insights" },
      { status: 500 }
    );
  }
}
