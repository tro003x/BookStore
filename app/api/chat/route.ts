import { NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';
import { prisma } from '@/lib/prisma';

export const runtime = 'nodejs';

async function buildCatalogContext(): Promise<string> {
  try {
    const [books, authors, publishers] = await Promise.all([
      prisma.book.findMany({
        where: { status: 'APPROVED' },
        select: {
          title: true,
          authorName: true,
          price: true,
          description: true,
          category: { select: { name: true } },
        },
        orderBy: { title: 'asc' },
        take: 200,
      }),
      prisma.author.findMany({
        where: { verificationStatus: 'APPROVED' },
        select: { name: true, bio: true },
        take: 100,
      }),
      prisma.publisher.findMany({
        where: { approved: true },
        select: { name: true },
        take: 100,
      }),
    ]);

    const booksText =
      books.length > 0
        ? books
            .map(
              (b) =>
                `- "${b.title}" by ${b.authorName} — $${Number(b.price).toFixed(2)} — ${b.category.name}${
                  b.description ? ` — ${b.description.slice(0, 120)}` : ''
                }`
            )
            .join('\n')
        : 'No books in catalog yet.';

    const authorsText =
      authors.length > 0
        ? authors
            .map((a) => `- ${a.name}${a.bio ? ` — ${a.bio.slice(0, 100)}` : ''}`)
            .join('\n')
        : 'No verified authors yet.';

    const publishersText =
      publishers.length > 0
        ? publishers.map((p) => `- ${p.name}`).join('\n')
        : 'No verified publishers yet.';

    return `
=== CURRENT CATALOG (${books.length} books) ===
${booksText}

=== VERIFIED AUTHORS (${authors.length}) ===
${authorsText}

=== VERIFIED PUBLISHERS (${publishers.length}) ===
${publishersText}
=== END CATALOG ===
`;
  } catch (err) {
    console.error('Catalog context error:', err);
    return 'Catalog temporarily unavailable.';
  }
}

const BASE_PROMPT = `You are BookBot, a friendly assistant for BoiStore — a virtual PDF bookstore.

About BoiStore:
- Sells PDF books that users read in-browser (no downloads)
- Publishers upload books, admins approve them
- Readers can preview the first 12 pages before buying
- Prices are one-time; purchased books stay in the reader's library forever
- Sign up as Reader, Author, or Publisher
- Authors and Publishers need verification (NID + selfie) before approval
- Refunds available within a short window

You have access to the current catalog, verified authors, and verified publishers shown below. Use them to answer user questions about specific books, authors, or publishers.

Guidelines:
- Keep answers short (2-4 sentences)
- Be helpful and friendly
- If a user asks about a specific book/author/publisher, look them up in the catalog below and answer precisely
- If the item is NOT in the catalog, say so honestly and suggest browsing the Catalog page
- Never invent books, authors, or publishers that aren't in the catalog
- Never make up prices — use only what's listed
- For account issues, suggest contacting support`;

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();

    if (!Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: 'No messages provided' }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'Chatbot is not configured' },
        { status: 500 }
      );
    }

    // Live catalog context
    const catalogContext = await buildCatalogContext();
    const systemPrompt = `${BASE_PROMPT}\n\n${catalogContext}`;

    const ai = new GoogleGenAI({ apiKey });

    const rawContents = messages.map((m: any) => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }],
    }));

    const firstUserIndex = rawContents.findIndex((c: any) => c.role === 'user');
    const contents =
      firstUserIndex === -1 ? [] : rawContents.slice(firstUserIndex);

    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents,
      config: {
        systemInstruction: systemPrompt,
      },
    });

    const text = response.text || 'Sorry, I could not generate a reply.';
    return NextResponse.json({ reply: text });
  } catch (error: any) {
    console.error('Chat API error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to get response' },
      { status: 500 }
    );
  }
}