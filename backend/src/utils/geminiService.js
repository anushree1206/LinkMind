import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

export async function generateSmartNudge(interactions) {
  try {
    // Format interaction history for AI context
    const interactionSummary = interactions.map(interaction => {
      return `- ${interaction.type} on ${new Date(interaction.date).toLocaleDateString()}: ${interaction.notes || 'No notes'}`;
    }).join('\n');

    const prompt = `
Based on the following interaction history with a contact, generate a personalized and actionable suggestion for the next outreach:

Interaction History:
${interactionSummary}

Please provide a specific, personalized suggestion for reaching out to this contact. Consider:
1. The time gap since last interaction
2. The type and context of previous interactions
3. A natural reason to reconnect
4. Keep it professional but warm

Respond with just the suggestion text, no additional formatting.
`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    return text.trim();
  } catch (error) {
    console.error('Gemini API Error:', error);
    
    // Fallback suggestion if AI fails
    const daysSinceLastInteraction = interactions.length > 0 
      ? Math.floor((new Date() - new Date(interactions[0].date)) / (1000 * 60 * 60 * 24))
      : 0;
    
    if (daysSinceLastInteraction > 30) {
      return "It's been a while since you last connected. Consider reaching out with a friendly check-in or sharing an interesting article relevant to their industry.";
    } else if (daysSinceLastInteraction > 7) {
      return "Follow up on your recent interaction and see how things are progressing on their end.";
    } else {
      return "Your recent interaction is still fresh. Consider scheduling a follow-up meeting or call to continue the conversation.";
    }
  }
}