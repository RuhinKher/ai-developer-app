// ai.controller.js

import { validationResult } from 'express-validator';  // Import validationResult to check for validation errors
import * as ai from '../services/ai.service.js';  // Import the ai service with the necessary functions
import AiInteraction from '../models/aiInteraction.model.js';  // Assuming you have this model to store interactions

// Function to get result based on a prompt (e.g., for other types of requests)
export const getResult = async (req, res) => {
    try {
        const { prompt } = req.query;  // Get the prompt from query parameters
        const result = await ai.generateResult(prompt);  // Call generateResult from ai.service.js
        res.send(result);  // Send the result as response
    } catch (error) {
        res.status(500).send({ message: error.message });  // Handle any errors
    }
}

// Function to review code with Gemini AI
export const reviewCodeWithGemini = async (req, res) => {
    // Check for validation errors in the request body
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { code } = req.body;  // Extract the code from request body
    const userId = req.user?._id?.toString() || "6632f44a55ff2caa60fe9898";  // Handle user ID

    try {
        // Get the generative model from ai.service.js
        const model = ai.getGenerativeModel();
        
        // Use the model to generate content (review the code)
        const result = await model.generateContent(`Review this code:\n\n${code}`);
        const response = await result.response.text();
        // Extract response text

        // Save the interaction in the database
        await AiInteraction.create({
            userId,
            prompt: code,  // The user's code
            response,  // The AI's response
            type: 'code-review',  // Type of interaction (code review)
            createdAt: new Date(),  // Timestamp of interaction
        });

        res.json({ response });  // Send the response back to the client
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Something went wrong with Gemini.' });  // Handle errors
    }
};
