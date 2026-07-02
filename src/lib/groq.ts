import Groq from 'groq-sdk'
import { getMockResponse } from './mockData'

const apiKey = import.meta.env.VITE_GROQ_API_KEY

if (!apiKey) {
  console.warn('Missing VITE_GROQ_API_KEY environment variable.')
}

export const groq = new Groq({
  apiKey: apiKey || '',
  dangerouslyAllowBrowser: true,
})

export type LearningMode =
  | 'standard'
  | 'story'
  | 'eli5'
  | 'step-by-step'
  | 'exam-prep'
  | 'interview-prep'

export type TutorStyle =
  | 'teacher'
  | 'professor'
  | 'friend'
  | 'storyteller'
  | 'mentor'

export type Difficulty = 'beginner' | 'intermediate' | 'advanced'

interface AskQuestionParams {
  question: string
  subject: string
  difficulty: Difficulty
  mode: LearningMode
  style: TutorStyle
}

// ─── Subject-specific formatting rules ────────────────────────────────────────
function getSubjectInstructions(subject: string): string {
  const s = subject.toLowerCase()

  if (s.includes('math') || s.includes('calculus') || s.includes('algebra') || s.includes('statistic') || s.includes('trigonometry') || s.includes('geometry')) {
    return `SUBJECT RULES (Mathematics):
- Always write mathematical expressions in LaTeX: inline with $...$ and block with $$...$$
- Show ALL computation steps explicitly — never skip arithmetic
- After deriving a result, verify it with a numerical check or substitution
- When introducing a formula, state: (1) what each variable means, (2) units if applicable, (3) when to use it
- Include at least one fully worked numerical example with real numbers
- Highlight common algebraic errors students make`
  }

  if (s.includes('physics')) {
    return `SUBJECT RULES (Physics):
- Write all equations in LaTeX (inline $...$ and block $$...$$)
- State the SI units for every quantity
- Explain the physical intuition behind each formula — not just the math
- Include a worked numerical problem with units tracked throughout
- Mention the assumptions and limitations of each law/formula
- Connect theory to real-world phenomena (e.g., why a car brakes, how a plane flies)`
  }

  if (s.includes('chemist')) {
    return `SUBJECT RULES (Chemistry):
- Write chemical equations with proper formatting (reactants → products)
- Balance every reaction shown
- Explain at the atomic/molecular level why reactions occur
- Include state symbols (s), (l), (g), (aq) in equations
- Show unit conversions and dimensional analysis in calculations
- Mention safety or real-world applications where relevant`
  }

  if (s.includes('biology') || s.includes('science') || s.includes('anatomy') || s.includes('genetics')) {
    return `SUBJECT RULES (Biology/Life Science):
- Explain processes sequentially using numbered steps
- Use precise scientific terminology but immediately define any technical term
- Connect molecular/cellular events to whole-organism effects
- Describe what would happen if the process fails (disease, disorder)
- Use comparisons (e.g., "the cell membrane acts like a nightclub bouncer…")
- Include relevant examples from human biology where possible`
  }

  if (s.includes('computer') || s.includes('programming') || s.includes('coding') || s.includes('algorithm') || s.includes('software') || s.includes('data structure')) {
    return `SUBJECT RULES (Computer Science):
- Always provide working code examples in appropriate language (Python preferred unless otherwise specified)
- Format all code in fenced code blocks with language tag: \`\`\`python
- Analyze time complexity (Big-O) and space complexity for any algorithm
- Show step-by-step execution trace for algorithms
- Highlight edge cases and how to handle them
- Compare alternative approaches with trade-offs`
  }

  if (s.includes('history') || s.includes('economics') || s.includes('geography') || s.includes('political') || s.includes('social')) {
    return `SUBJECT RULES (Humanities/Social Science):
- Ground every claim in specific dates, names, events, or data
- Show cause → effect chains clearly
- Present multiple perspectives where they exist
- Use concrete statistics or examples to support abstract points
- Draw connections to present-day relevance
- Avoid vague generalisations — be specific`
  }

  if (s.includes('english') || s.includes('literature') || s.includes('grammar') || s.includes('writing')) {
    return `SUBJECT RULES (English/Literature):
- Quote primary sources with quotation marks and citation
- Analyse language choices, not just plot summary
- Identify and name literary devices (metaphor, irony, etc.)
- For grammar topics, provide correct vs. incorrect example pairs
- Include practical writing tips the student can immediately apply`
  }

  // Generic fallback
  return `SUBJECT RULES (General):
- Be precise and factual — avoid vague generalisations
- Support every claim with a concrete example or evidence
- Define all technical terms on first use
- Structure your answer logically from foundational to advanced
- Include at least one worked example or case study`
}

// ─── Style personas ─────────────────────────────────────────────────────────
function getStylePersona(style: TutorStyle): string {
  const personas: Record<TutorStyle, string> = {
    teacher: 'You are an experienced, patient school teacher. You build understanding step-by-step, use classroom-style examples, and check comprehension by anticipating common student questions.',
    professor: 'You are a university professor with deep subject expertise. You provide academically rigorous explanations, cite theoretical foundations, use precise terminology, and connect ideas to broader academic context.',
    friend: 'You are a brilliant friend who happens to know everything. You explain things conversationally and casually, use relatable everyday analogies, crack the occasional light joke, and make learning feel effortless.',
    storyteller: 'You are a master educator who uses narrative. You turn concepts into compelling stories with characters, conflict, and resolution — making ideas viscerally memorable.',
    mentor: 'You are a supportive, experienced mentor. You guide students to discover answers through thoughtful Socratic questions, build their confidence, acknowledge what they might find hard, and celebrate small wins.',
  }
  return personas[style]
}

// ─── Difficulty calibration ──────────────────────────────────────────────────
function getDifficultyContext(difficulty: Difficulty): string {
  const contexts: Record<Difficulty, string> = {
    beginner: 'AUDIENCE: Complete beginner. Zero assumed knowledge. Define every term. Use everyday analogies. Avoid acronyms unless you spell them out. Prioritise clarity over completeness.',
    intermediate: 'AUDIENCE: Student with basic familiarity. You can use standard terminology but briefly explain it. Build on what they likely know. Bridge foundational and advanced ideas.',
    advanced: 'AUDIENCE: Advanced student or practitioner. Use technical language freely. Dive into nuances, edge cases, theoretical depth, and research-level insights. Skip basic definitions.',
  }
  return contexts[difficulty]
}

// ─── Mode-specific output templates ─────────────────────────────────────────
function getModeTemplate(mode: LearningMode): string {
  const templates: Record<LearningMode, string> = {
    standard: `Produce a comprehensive, well-structured explanation following this EXACT format:

## 🎯 Overview
A 2-3 sentence clear definition of what this concept is and why it matters.

## 📚 Core Concepts
Explain the key ideas, principles, and theory. Use sub-headings if needed.

## 🔢 Worked Example
Walk through at least one complete, detailed example with real numbers or a concrete scenario. Show every step.

## ⚠️ Common Misconceptions
List 2-3 mistakes students often make and explain why they are wrong.

## 📝 Summary
3-5 bullet points capturing the most important takeaways.

## 💡 Follow-up Tip
One practical advice or next thing the student should learn to deepen understanding.`,

    'step-by-step': `Break the explanation into clear, numbered steps. Follow this EXACT format:

## 🎯 What We Are Solving
State precisely what this explanation will accomplish.

## 📋 Prerequisites
What the student needs to know before starting (1-3 items).

## 🔢 Step-by-Step Solution
**Step 1: [Title]**
[Explanation] — explain WHY this step is needed, not just what to do.

**Step 2: [Title]**
[Explanation]

…continue until complete. Include all intermediate calculations.

## ✅ Verification
How to check the answer is correct.

## 🧠 Key Formula / Rule
The one formula or rule to remember from this explanation.`,

    'exam-prep': `Produce exam-focused content following this EXACT format:

## 📌 Examiner's Definition (memorise this)
A concise, mark-scheme-ready definition.

## ⭐ Key Points (High-Yield)
The facts, formulas, and concepts most likely to appear in exams — in bullet form.

## 📐 Important Formulas
List every relevant formula with what each symbol means.

## 🗂️ Typical Exam Questions
Give 3 example exam questions on this topic (with model answers or answer hints).

## 🚫 Common Exam Mistakes
The errors that lose marks — be specific.

## 🎯 Memory Aids
Mnemonics, acronyms, or tricks to recall key facts under pressure.`,

    eli5: `Explain this like the student is 10 years old. Follow this format:

## 🌟 The Big Idea (in one sentence)
[Simplest possible statement of the concept]

## 🎈 Let Me Tell You a Story…
Use a fun, relatable analogy or mini-story that a child could follow. No jargon whatsoever.

## 🤔 But How Does It Actually Work?
Explain the mechanism in plain, simple language, building from the story.

## 🌍 Where Do We See This in Real Life?
2-3 everyday examples the student can relate to.

## 🧩 The One Thing to Remember
One simple sentence that captures the whole idea.`,

    story: `Explain the concept through an engaging narrative. Follow this format:

## 📖 The Story
Write an engaging, memorable story (3-5 paragraphs) that illustrates the concept. Give characters real names. Build tension or curiosity. The story should make the concept emotionally memorable.

## 🔬 The Science/Theory Behind the Story
Now explain the actual concept accurately, referencing the story elements.

## 📝 Summary
What the story was really teaching us.

## 🔑 Key Takeaways
- Bullet points of the core facts

## 🌍 Real-World Analogy
One more comparison from everyday life.

## 🧠 Memory Trick
A mnemonic or mental hook to remember this concept.`,

    'interview-prep': `Prepare the student to answer this in an interview. Follow this EXACT format:

## 💬 The 30-Second Answer (say this first)
A crisp, confident definition suitable for opening your interview answer.

## 🔍 Deep Dive Explanation
A thorough explanation showing deep understanding — for when the interviewer says "tell me more."

## 🛠️ Practical / Real-World Application
How this concept is used in actual practice (industry, research, or projects).

## ❓ Likely Follow-Up Questions
5 questions an interviewer might ask next, with brief model answers.

## 🏆 Impressive Points to Mention
Advanced nuances, trade-offs, or insights that will set you apart from other candidates.`,
  }
  return templates[mode]
}

// ─── Build the complete system prompt ────────────────────────────────────────
function buildSystemPrompt(mode: LearningMode, style: TutorStyle, difficulty: Difficulty, subject: string): string {
  return `${getStylePersona(style)}

${getDifficultyContext(difficulty)}

${getSubjectInstructions(subject)}

YOUR TASK:
${getModeTemplate(mode)}

QUALITY RULES — follow these always:
1. Be factually accurate. If you are uncertain, say so explicitly.
2. Never use filler phrases like "Great question!" or "Certainly!"
3. Every claim must be supported by an example, evidence, or derivation.
4. Use markdown formatting: ## headings, **bold** key terms, bullet lists, code blocks, LaTeX math.
5. Match the student's level precisely — never talk down or above their head.
6. Aim for depth over breadth — it's better to explain fewer things excellently than many things poorly.`
}

// ─── Main answer generation ───────────────────────────────────────────────────
export async function askQuestion(params: AskQuestionParams): Promise<string> {
  const { question, subject, difficulty, mode, style } = params

  if (!apiKey) {
    const mock = getMockResponse(question, subject, mode, style, difficulty)
    await new Promise(resolve => setTimeout(resolve, 800))
    return mock.answer
  }

  // Temperature tuned per mode: factual modes lower, creative modes higher
  const modeTemperature: Record<LearningMode, number> = {
    standard: 0.35,
    'step-by-step': 0.25,
    'exam-prep': 0.25,
    'interview-prep': 0.35,
    eli5: 0.55,
    story: 0.75,
  }

  const systemPrompt = buildSystemPrompt(mode, style, difficulty, subject)

  const userMessage = `Subject: ${subject}
Difficulty Level: ${difficulty}
Student's Question: ${question}

Please answer this question following the format and quality rules in your instructions.`

  const completion = await groq.chat.completions.create({
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userMessage },
    ],
    model: 'llama-3.3-70b-versatile',
    temperature: modeTemperature[mode],
    max_tokens: 8192,
    top_p: 0.9,
  })

  return completion.choices[0]?.message?.content || 'I could not generate a response. Please try again.'
}

// ─── Quiz generation ──────────────────────────────────────────────────────────
export async function generateQuiz(
  question: string,
  answer: string,
  subject: string
): Promise<string> {
  if (!apiKey) {
    const mock = getMockResponse(question, subject)
    return JSON.stringify(mock.quiz)
  }

  const prompt = `You are generating a quiz to test understanding of the following learning session.

Subject: ${subject}
Topic / Question: ${question}
Teaching Content:
${answer.substring(0, 3000)}

Generate a comprehensive quiz with EXACTLY the following JSON structure:
{
  "mcq": [
    {
      "id": 1,
      "question": "Specific, unambiguous question that tests understanding (not just recall)",
      "options": ["A) Option 1", "B) Option 2", "C) Option 3", "D) Option 4"],
      "correct": "A",
      "explanation": "Detailed explanation of why A is correct and why the others are wrong"
    }
  ],
  "trueFalse": [
    {
      "id": 6,
      "statement": "A clear, testable statement (avoid trivially obvious ones)",
      "correct": true,
      "explanation": "Explanation of why this is true/false"
    }
  ],
  "fillBlanks": [
    {
      "id": 8,
      "sentence": "The ___ performs ___ in order to ___",
      "blanks": ["answer1", "answer2", "answer3"],
      "explanation": "Why these are the correct answers"
    }
  ],
  "scenario": {
    "id": 10,
    "scenario": "A realistic, challenging scenario that requires applying the concept",
    "question": "A specific question about the scenario",
    "expectedAnswer": "Comprehensive model answer covering all key points",
    "keyPoints": ["Key point 1", "Key point 2", "Key point 3", "Key point 4"]
  }
}

Requirements:
- Generate EXACTLY 5 MCQ (ids 1-5), 2 True/False (ids 6-7), 2 Fill-in-the-blank (ids 8-9), 1 Scenario (id 10)
- MCQ: make the wrong options plausible (common misconceptions, not obvious wrong answers)
- All questions must directly test the content in the Teaching Content above
- Fill-in-blank sentences must be grammatically complete when blanks are filled
- Return ONLY the raw JSON. No markdown. No explanation. No code fences.`

  const completion = await groq.chat.completions.create({
    messages: [
      {
        role: 'system',
        content: 'You are a precise quiz generator. Output only valid JSON with no additional text, markdown, or explanation.',
      },
      { role: 'user', content: prompt },
    ],
    model: 'llama-3.3-70b-versatile',
    temperature: 0.2,
    max_tokens: 4000,
  })

  return completion.choices[0]?.message?.content || '{}'
}

// ─── Notes generation ─────────────────────────────────────────────────────────
export async function generateNotes(
  question: string,
  answer: string,
  subject: string,
  noteType: 'revision' | 'bullet' | 'formula' | 'flashcard'
): Promise<string> {
  if (!apiKey) {
    const mock = getMockResponse(question, subject)
    return mock.notes[noteType] || mock.notes.revision
  }

  const noteTypeInstructions: Record<string, string> = {
    revision: `Create comprehensive revision notes with this structure:
## Topic: [Topic Name]
**Subject:** ${subject}

## Core Definition
[Precise definition]

## Key Concepts
[Sub-headed sections for each major idea]

## Important Formulas / Rules
[Every formula with variable definitions]

## Worked Example
[One complete worked example]

## Common Mistakes to Avoid
[Bullet list]

## Quick Recap
[5-bullet summary]`,

    bullet: `Create ultra-concise bullet-point notes:
# ${question} — Quick Notes

**Core idea:** [One sentence]

**Must know:**
• [Key point 1]
• [Key point 2]
• [Key point 3]
…

**Formulas:** [Any relevant formulas]

**Remember:** [The single most important thing]`,

    formula: `Extract and organise ALL formulas, equations, and key relationships:
# Formulas & Key Relationships: ${question}

## Core Formulas
| Formula | What it means | When to use |
|---------|--------------|-------------|
| $$formula$$ | description | context |

## Symbol Reference
| Symbol | Meaning | Unit |
|--------|---------|------|

## Derivation Notes
[Brief notes on where key formulas come from]

## Worked Calculation
[One numerical example using these formulas]`,

    flashcard: `Create 8-10 Q&A flashcard pairs for active recall:

---
**Q1:** [Clear, specific question]
**A1:** [Precise, complete answer]

---
**Q2:** [Next question]
**A2:** [Answer]

[Continue for 8-10 cards. Make questions targeted — avoid yes/no answers. Include at least 2 calculation-based cards if the subject is quantitative.]`,
  }

  const prompt = `Create ${noteType} study notes for this learning session.

Subject: ${subject}
Topic: ${question}
Source Material:
${answer.substring(0, 3000)}

${noteTypeInstructions[noteType]}

Instructions:
- Be factually accurate — use the source material as your ground truth
- Use proper markdown formatting
- For mathematical content, use LaTeX: inline $...$ and block $$...$$
- Be comprehensive but not verbose — every word must earn its place`

  const completion = await groq.chat.completions.create({
    messages: [
      {
        role: 'system',
        content: 'You are an expert academic note-taker. Create precise, well-structured, exam-ready study notes. Use proper markdown and LaTeX where needed.',
      },
      { role: 'user', content: prompt },
    ],
    model: 'llama-3.3-70b-versatile',
    temperature: 0.3,
    max_tokens: 3000,
  })

  return completion.choices[0]?.message?.content || ''
}

// ─── Follow-up questions ──────────────────────────────────────────────────────
export async function generateFollowUpQuestions(
  question: string,
  answer: string,
  subject: string
): Promise<string[]> {
  if (!apiKey) {
    const mock = getMockResponse(question, subject)
    return mock.followUps
  }

  const prompt = `A student just learned about the following topic. Suggest 4 excellent follow-up questions that will deepen their understanding progressively.

Subject: ${subject}
Topic Covered: ${question}
Summary of What Was Explained: ${answer.substring(0, 600)}

Requirements for follow-up questions:
- Each question should build naturally on the topic
- Questions should progress in depth: 2 slightly deeper dives, 1 practical application, 1 connecting to a related concept
- Questions should be specific and interesting — not generic
- Do NOT repeat what was already explained

Return ONLY a JSON array of exactly 4 question strings. Example:
["Question 1?", "Question 2?", "Question 3?", "Question 4?"]`

  const completion = await groq.chat.completions.create({
    messages: [
      {
        role: 'system',
        content: 'Return only a valid JSON array of 4 strings. No markdown, no explanation, just the JSON array.',
      },
      { role: 'user', content: prompt },
    ],
    model: 'llama-3.1-8b-instant',
    temperature: 0.6,
    max_tokens: 400,
  })

  try {
    const content = completion.choices[0]?.message?.content || '[]'
    const cleaned = content.replace(/```json/g, '').replace(/```/g, '').trim()
    return JSON.parse(cleaned)
  } catch {
    return [
      `What are the most common real-world applications of ${question}?`,
      `What are the limitations or edge cases of this concept?`,
      `How does this topic connect to other areas of ${subject}?`,
      `What advanced topics build directly on this?`,
    ]
  }
}

// ─── JSON quiz parser ─────────────────────────────────────────────────────────
export function parseQuizFromJSON(jsonStr: string): any {
  try {
    const cleaned = jsonStr.replace(/```json/g, '').replace(/```/g, '').trim()
    return JSON.parse(cleaned)
  } catch (error) {
    console.error('Failed to parse quiz JSON:', error)
    return null
  }
}
