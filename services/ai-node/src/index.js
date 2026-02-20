import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { ChatGroq } from '@langchain/groq';
import { HumanMessage, AIMessage, SystemMessage } from '@langchain/core/messages';
import { StateGraph, END } from '@langchain/langgraph';
import { v4 as uuidv4 } from 'uuid';
import { QdrantClient } from '@qdrant/js-client-rest';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Initialize Groq model (Llama 3.3 70b)
const model = new ChatGroq({
    apiKey: process.env.GROQ_API_KEY,
    model: "llama-3.3-70b-versatile",
    temperature: 0.7,
});

// System prompt for medical AI
const SYSTEM_PROMPT = `You are VanguardHealth AI, a helpful medical assistant. 
You provide general health information and help users understand their health data.
Always remind users to consult healthcare professionals for medical advice.
Be empathetic, clear, and informative.`;

// Chat history store (in-memory for now)
const chatSessions = new Map();

// LangGraph state definition
const graphState = {
    messages: {
        value: (x, y) => y ?? x,
        default: () => [],
    },
    context: {
        value: (x, y) => y ?? x,
        default: () => '',
    },
};

// Agent node - processes user input and generates response
async function agentNode(state) {
    const { messages, context } = state;

    const systemMessage = new SystemMessage(SYSTEM_PROMPT + (context ? `\n\nContext:\n${context}` : ''));
    const allMessages = [systemMessage, ...messages];

    const response = await model.invoke(allMessages);

    return {
        messages: [...messages, response],
        context: state.context,
    };
}

// Build LangGraph
const workflow = new StateGraph({ channels: graphState })
    .addNode('agent', agentNode)
    .addEdge('__start__', 'agent')
    .addEdge('agent', END);

const graph = workflow.compile();

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ status: 'healthy', service: 'vanguard-ai' });
});

// Chat endpoint
app.post('/chat', async (req, res) => {
    try {
        const { message, session_id, patient_id, all_patients, conversation_history } = req.body;

        if (!message) {
            return res.status(400).json({ error: 'Message is required' });
        }

        const sessionId = session_id || uuidv4();

        // Get or create session
        if (!chatSessions.has(sessionId)) {
            chatSessions.set(sessionId, { messages: [], patientId: patient_id, allPatients: all_patients });
        }
        const session = chatSessions.get(sessionId);

        // If frontend sent conversation_history, rebuild session messages from it
        if (conversation_history && Array.isArray(conversation_history) && conversation_history.length > 0) {
            session.messages = conversation_history.map(m => {
                if (m.role === 'user') {
                    return new HumanMessage(m.content);
                } else {
                    return new AIMessage(m.content);
                }
            });
        }

        // Add current user message
        const userMessage = new HumanMessage(message);
        session.messages.push(userMessage);

        // Build context based on mode
        let context = '';

        if (all_patients) {
            // RAG Mode: Use Semantic Search to find relevant records
            try {
                const { GoogleGenerativeAI } = await import('@google/generative-ai');
                const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
                const embeddingModel = genAI.getGenerativeModel({ model: 'text-embedding-004' });

                const result = await embeddingModel.embedContent(message);
                const queryEmbedding = result.embedding.values;

                // Search Qdrant for relevant records
                const searchResult = await qdrantClient.search(COLLECTION_NAME, {
                    vector: queryEmbedding,
                    limit: 10,
                    with_payload: true,
                });

                if (searchResult.length > 0) {
                    const relevantRecords = searchResult.map(item => ({
                        patient_id: item.payload?.patient_id,
                        record_type: item.payload?.record_type,
                        content: item.payload?.text_preview,
                        relevance: (item.score * 100).toFixed(1) + '%'
                    }));

                    context = `[ALL PATIENTS MODE - RAG Search Results]\n` +
                        `Query: "${message}"\n` +
                        `Found ${relevantRecords.length} relevant records:\n\n` +
                        relevantRecords.map((r, i) =>
                            `${i + 1}. Patient ${r.patient_id} (${r.record_type}) [${r.relevance}]:\n${r.content}`
                        ).join('\n\n');
                } else {
                    context = '[ALL PATIENTS MODE] No relevant records found in database.';
                }
            } catch (err) {
                console.log('RAG search failed:', err.message);
                context = '[ALL PATIENTS MODE] Could not search records.';
            }
        } else if (patient_id) {
            // Single patient mode: fetch specific patient records
            try {
                const backendUrl = process.env.BACKEND_URL || 'http://localhost:50051';
                const response = await fetch(`${backendUrl}/records/${patient_id}`);
                if (response.ok) {
                    const records = await response.json();

                    // Add Patient Demographics Context
                    const { patient_context } = req.body;
                    let profileContext = '';
                    if (patient_context) {
                        profileContext = `Patient Profile:\n` +
                            `- ID: ${patient_id}\n` +
                            `- Name: ${patient_context.name}\n` +
                            `- Gender: ${patient_context.gender}\n` +
                            `- Date of Birth: ${patient_context.date_of_birth || 'N/A'}\n` +
                            `- National ID: ${patient_context.national_id || 'N/A'}\n\n`;
                    }

                    if (records && records.length > 0) {
                        context = `${profileContext}Patient ${patient_id} health records:\n${JSON.stringify(records.slice(0, 5), null, 2)}`;
                    } else {
                        context = `${profileContext}Patient ${patient_id} has no healthy records yet.`;
                    }
                }
            } catch (err) {
                console.log('Could not fetch patient context:', err.message);
            }
        }

        // Run LangGraph
        const result = await graph.invoke({
            messages: session.messages,
            context: context,
        });

        // Update session
        session.messages = result.messages;

        // Get AI response
        const aiResponse = result.messages[result.messages.length - 1];

        // Save to backend
        try {
            await fetch(`${process.env.BACKEND_URL || 'http://localhost:50051'}/chat-history`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    session_id: sessionId,
                    patient_id: patient_id,
                    role: 'assistant',
                    content: aiResponse.content,
                }),
            });
        } catch (err) {
            // Silent fail for chat history
        }

        res.json({
            session_id: sessionId,
            response: aiResponse.content,
            message_count: session.messages.length,
        });

    } catch (error) {
        console.error('Chat error:', error);
        res.status(500).json({ error: error.message });
    }
});

// Stream chat endpoint
app.post('/chat/stream', async (req, res) => {
    try {
        const { message, session_id, patient_id } = req.body;

        if (!message) {
            return res.status(400).json({ error: 'Message is required' });
        }

        res.setHeader('Content-Type', 'text/event-stream');
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Connection', 'keep-alive');

        const sessionId = session_id || uuidv4();

        // Get or create session
        if (!chatSessions.has(sessionId)) {
            chatSessions.set(sessionId, { messages: [], patientId: patient_id });
        }
        const session = chatSessions.get(sessionId);

        // Add user message
        session.messages.push(new HumanMessage(message));

        // Stream response
        const systemMessage = new SystemMessage(SYSTEM_PROMPT);
        const allMessages = [systemMessage, ...session.messages];

        const stream = await model.stream(allMessages);
        let fullResponse = '';

        for await (const chunk of stream) {
            const content = chunk.content;
            fullResponse += content;
            res.write(`data: ${JSON.stringify({ content, done: false })}\n\n`);
        }

        // Add full response to session
        session.messages.push(new AIMessage(fullResponse));

        res.write(`data: ${JSON.stringify({ content: '', done: true, session_id: sessionId })}\n\n`);
        res.end();

    } catch (error) {
        console.error('Stream error:', error);
        res.write(`data: ${JSON.stringify({ error: error.message, done: true })}\n\n`);
        res.end();
    }
});

// Embed text endpoint (for RAG)
app.post('/embed', async (req, res) => {
    try {
        const { text } = req.body;

        if (!text) {
            return res.status(400).json({ error: 'Text is required' });
        }

        // Using Gemini embedding model
        const { GoogleGenerativeAI } = await import('@google/generative-ai');
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const embeddingModel = genAI.getGenerativeModel({ model: 'text-embedding-004' });

        const result = await embeddingModel.embedContent(text);

        res.json({
            embedding: result.embedding.values,
            dimension: result.embedding.values.length,
        });

    } catch (error) {
        console.error('Embed error:', error);
        res.status(500).json({ error: error.message });
    }
});

// ============================================
// Qdrant Vectorization Endpoint
// ============================================

const QDRANT_URL = process.env.QDRANT_URL || 'http://localhost:6333';
const COLLECTION_NAME = 'health_records';
const VECTOR_SIZE = 768; // Gemini text-embedding-004 dimension

const qdrantClient = new QdrantClient({ url: QDRANT_URL });

// Ensure collection exists
async function ensureCollection() {
    try {
        const collections = await qdrantClient.getCollections();
        const exists = collections.collections.some(c => c.name === COLLECTION_NAME);

        if (!exists) {
            await qdrantClient.createCollection(COLLECTION_NAME, {
                vectors: {
                    size: VECTOR_SIZE,
                    distance: 'Cosine',
                },
            });
            console.log(`✅ Created Qdrant collection: ${COLLECTION_NAME}`);
        }
    } catch (error) {
        console.error('Qdrant collection error:', error.message);
    }
}

// Initialize collection on startup
ensureCollection();

// Vectorize and store endpoint
app.post('/vectorize', async (req, res) => {
    try {
        const { record_id, patient_id, record_type, data } = req.body;

        if (!record_id || !data) {
            return res.status(400).json({ error: 'record_id and data are required' });
        }

        // Convert data to text for embedding
        const textContent = typeof data === 'string' ? data : JSON.stringify(data);

        // Generate embedding using Gemini
        const { GoogleGenerativeAI } = await import('@google/generative-ai');
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const embeddingModel = genAI.getGenerativeModel({ model: 'text-embedding-004' });

        const result = await embeddingModel.embedContent(textContent);
        const embedding = result.embedding.values;

        // Upsert to Qdrant
        await qdrantClient.upsert(COLLECTION_NAME, {
            points: [
                {
                    id: record_id.replace(/-/g, '').substring(0, 32), // Qdrant needs specific ID format
                    vector: embedding,
                    payload: {
                        record_id,
                        patient_id,
                        record_type,
                        text_preview: textContent.substring(0, 500),
                        indexed_at: new Date().toISOString(),
                    },
                },
            ],
        });

        console.log(`📊 Indexed record ${record_id} to Qdrant`);

        res.json({
            status: 'indexed',
            record_id,
            collection: COLLECTION_NAME,
            vector_dimension: embedding.length,
        });

    } catch (error) {
        console.error('Vectorize error:', error);
        res.status(500).json({ error: error.message });
    }
});

// ============================================
// Semantic Search Endpoint
// ============================================
app.post('/search', async (req, res) => {
    try {
        const { query, patient_id, limit = 10 } = req.body;

        if (!query) {
            return res.status(400).json({ error: 'Query is required' });
        }

        // Generate embedding for query
        const { GoogleGenerativeAI } = await import('@google/generative-ai');
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const embeddingModel = genAI.getGenerativeModel({ model: 'text-embedding-004' });

        const result = await embeddingModel.embedContent(query);
        const queryEmbedding = result.embedding.values;

        // Build filter if patient_id provided
        const filter = patient_id ? {
            must: [{ key: 'patient_id', match: { value: patient_id } }]
        } : undefined;

        // Search Qdrant
        const searchResult = await qdrantClient.search(COLLECTION_NAME, {
            vector: queryEmbedding,
            limit: parseInt(limit),
            filter: filter,
            with_payload: true,
        });

        // Format results
        const results = searchResult.map(item => ({
            score: item.score,
            record_id: item.payload?.record_id,
            patient_id: item.payload?.patient_id,
            record_type: item.payload?.record_type,
            text_preview: item.payload?.text_preview,
            indexed_at: item.payload?.indexed_at,
        }));

        console.log(`🔍 Search "${query}" returned ${results.length} results`);

        res.json({
            query,
            count: results.length,
            results,
        });

    } catch (error) {
        console.error('Search error:', error);
        res.status(500).json({ error: error.message });
    }
});

// Start server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`🚀 VanguardHealth AI Service running on port ${PORT}`);
    console.log(`   Gemini API: ${process.env.GEMINI_API_KEY ? 'Configured' : 'Missing!'}`);
});
