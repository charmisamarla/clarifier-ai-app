// Mock Data & Canned Responses for Clarifier AI
import { Subject } from './constants'

export const CANNED_RESPONSES: Record<string, {
  answer: string;
  quiz: any;
  notes: Record<string, string>;
  followUps: string[];
}> = {
  "how to do mean for grouped data using step deviation method": {
    answer: `## Mean of Grouped Data using Step Deviation Method

The **Step Deviation Method** is an efficient way to calculate the arithmetic mean of grouped data, especially when the class marks ($x_i$) and frequencies ($f_i$) are large numbers. It simplifies calculations by reducing the size of the values we multiply.

### Formula
The mean ($\\bar{x}$) is calculated using:

$$\\bar{x} = a + \\left( \\frac{\\sum f_i u_i}{\\sum f_i} \\right) \\times h$$

Where:
- **$a$** = Assumed Mean (usually the middle value of class marks)
- **$h$** = Class Size / Width of the class intervals
- **$f_i$** = Frequency of the $i$-th class interval
- **$u_i$** = $\\frac{x_i - a}{h}$ (the step deviation)
- **$x_i$** = Mid-point or Class Mark of the $i$-th interval, calculated as:
  $$x_i = \\frac{\\text{Lower Limit} + \\text{Upper Limit}}{2}$$

---

### Step-by-Step Example

Let's calculate the mean of the following grouped data:

| Class Interval | Frequency ($f_i$) |
| :--- | :--- |
| 10 - 20 | 5 |
| 20 - 30 | 8 |
| 30 - 40 | 12 |
| 40 - 50 | 7 |
| 50 - 60 | 3 |

#### Step 1: Calculate the Class Marks ($x_i$)
The mid-point of each interval:
- 10 - 20: $x_1 = \\frac{10 + 20}{2} = 15$
- 20 - 30: $x_2 = 25$
- 30 - 40: $x_3 = 35$
- 40 - 50: $x_4 = 45$
- 50 - 60: $x_5 = 55$

#### Step 2: Choose Assumed Mean ($a$) and Class Size ($h$)
- Let Assumed Mean **$a = 35$** (the middle class mark).
- Class width **$h = 10$** (since $20 - 10 = 10$).

#### Step 3: Compute $u_i = \\frac{x_i - a}{h}$ and $f_i u_i$

| Class Interval | Frequency ($f_i$) | Class Mark ($x_i$) | $u_i = \\frac{x_i - 35}{10}$ | $f_i u_i$ |
| :--- | :--- | :--- | :--- | :--- |
| 10 - 20 | 5 | 15 | $\\frac{15 - 35}{10} = -2$ | $-10$ |
| 20 - 30 | 8 | 25 | $\\frac{25 - 35}{10} = -1$ | $-8$ |
| 30 - 40 | 12 | **35 ($a$)** | $\\frac{35 - 35}{10} = 0$ | $0$ |
| 40 - 50 | 7 | 45 | $\\frac{45 - 35}{10} = 1$ | $7$ |
| 50 - 60 | 3 | 55 | $\\frac{55 - 35}{10} = 2$ | $6$ |
| **Total** | **$\\sum f_i = 35$** | | | **$\\sum f_i u_i = -5$** |

#### Step 4: Substitute Values in the Formula
$$\\bar{x} = a + \\left( \\frac{\\sum f_i u_i}{\\sum f_i} \\right) \\times h$$
$$\\bar{x} = 35 + \\left( \\frac{-5}{35} \\right) \\times 10$$
$$\\bar{x} = 35 - \\left( \\frac{1}{7} \\right) \\times 10$$
$$\\bar{x} = 35 - 1.43 = 33.57$$

The mean of the grouped data is **33.57**.

---

## 📝 Summary
The Step Deviation Method simplifies calculations for the mean of grouped data by scaling down values using an assumed mean $a$ and class size $h$.

## 🔑 Key Takeaways
- Ideal for large class marks and frequencies.
- Always choose $a$ from the middle of the class marks $x_i$ to keep deviation numbers small.
- The step deviations $u_i$ will always be consecutive integers (..., -2, -1, 0, 1, 2, ...), which makes arithmetic simple.

## 🌍 Real World Analogy
Think of this like normalizing test scores. Instead of grading out of 2400, you scale them down (deviation) to a GPA scale out of 4 to make them easier to analyze, and then scale the final average back up.

## 🧠 Memory Trick
**S**tep **D**eviation: **S**ubtract assumed mean, **D**ivide by class size!`,
    quiz: {
      mcq: [
        { id: 1, question: "What is the primary benefit of the Step Deviation Method over the Direct Method?", options: ["A) It calculates a more accurate mean", "B) It does not require frequency data", "C) It simplifies calculations by reducing the size of numerical values", "D) It can only be used for ungrouped data"], correct: "C", explanation: "By subtracting the assumed mean and dividing by the class size, it scales down the numbers, simplifying multiplication." },
        { id: 2, question: "In the step deviation formula, what does 'h' represent?", options: ["A) Assumed mean", "B) Frequency", "C) Class mark", "D) Class width (size)"], correct: "D", explanation: "'h' represents the size of the class intervals." },
        { id: 3, question: "How is the step deviation 'ui' calculated?", options: ["A) ui = (xi - a) * h", "B) ui = (xi - a) / h", "C) ui = (xi + a) / h", "D) ui = xi - a"], correct: "B", explanation: "ui is the deviation (xi - a) divided by the class width h." },
        { id: 4, question: "If class intervals are 10-20, 20-30, 30-40, what is the class width 'h'?", options: ["A) 5", "B) 10", "C) 15", "D) 20"], correct: "B", explanation: "h is the difference between limits: 20 - 10 = 10." },
        { id: 5, question: "From which column do we choose the assumed mean 'a'?", options: ["A) Frequencies (fi)", "B) Class intervals", "C) Class marks (xi)", "D) Step deviations (ui)"], correct: "C", explanation: "The assumed mean 'a' is chosen from the class marks (xi), usually near the center." }
      ],
      trueFalse: [
        { id: 6, statement: "The Step Deviation Method yields a different, more approximate value of mean compared to the Direct Method.", correct: false, explanation: "All methods (Direct, Assumed Mean, Step Deviation) yield the exact same value of mean mathematically." },
        { id: 7, statement: "The class width 'h' must be uniform across all class intervals to apply the standard step deviation formula.", correct: true, explanation: "If 'h' is not uniform, dividing by 'h' will result in non-integer deviations, defeating the purpose of scaling." }
      ],
      fillBlanks: [
        { id: 8, sentence: "The mid-point of a class interval is called the class ___.", blanks: ["mark"], explanation: "Class mark or mid-value is calculated as (Lower Limit + Upper Limit)/2." },
        { id: 9, sentence: "If assumed mean is a, deviation is calculated as xi minus ___.", blanks: ["a"], explanation: "Deviation di = xi - a." }
      ],
      scenario: {
        id: 10,
        scenario: "You are given a dataset of factory worker salaries where class marks are 15000, 25000, 35000, 45000 and frequencies are in hundreds.",
        question: "Why is the Step Deviation Method highly recommended here, and how would you pick 'a' and 'h'?",
        expectedAnswer: "It is recommended because the class marks (salaries) are very large. Doing direct multiplication would be tedious. You would choose assumed mean 'a' as 35000 (middle class mark) and class size 'h' as 10000 (difference between class marks). This reduces ui to simple values: -2, -1, 0, 1.",
        keyPoints: ["Very large values make direct method tedious", "Pick a = 35000 (middle value)", "Pick h = 10000 (class interval size)"]
      }
    },
    notes: {
      revision: "### Revision Notes: Step Deviation Method\\n- **Formula**: $\\bar{x} = a + \\left( \\frac{\\sum f_i u_i}{\\sum f_i} \\right) \\times h$\\n- **Key Steps**:\\n  1. Find class mark $x_i = \\frac{\\text{Lower} + \\text{Upper}}{2}$.\\n  2. Select assumed mean $a$ from $x_i$.\\n  3. Define $u_i = \\frac{x_i - a}{h}$.\\n  4. Calculate $f_i u_i$, find totals $\\sum f_i$ and $\\sum f_i u_i$.\\n  5. Apply formula.",
      bullet: "- **Step Deviation Method**: Scaled version of assumed mean method.\\n- **Formula**: $\\bar{x} = a + \\frac{\\sum f_i u_i}{\\sum f_i} \\cdot h$.\\n- **Variable $u_i$**: $\\frac{x_i - a}{h}$.\\n- **Goal**: Minimize mental arithmetic and multiplication size.",
      formula: "### Step Deviation Formula\\n$$\\bar{x} = a + h \\cdot \\frac{\\sum_{i=1}^n f_i u_i}{\\sum_{i=1}^n f_i}$$\\nWhere $u_i = \\frac{x_i - a}{h}$ and $x_i = \\frac{L_i + U_i}{2}$",
      flashcard: "Q: What does 'a' stand for in step deviation?\\nA: 'a' stands for Assumed Mean, selected from the class marks.\\n\\nQ: Does step deviation change the calculated mean value?\\nA: No, it gives the exact same mathematical mean as the direct and assumed mean methods."
    },
    followUps: [
      "What is the difference between Direct Method, Assumed Mean Method, and Step Deviation Method?",
      "Can we use the Step Deviation Method if the class intervals are not of equal size?",
      "How do you find the median for grouped data?",
      "How do you find the mode for grouped data?"
    ]
  },
  "Explain recursion with an example": {
    answer: `## Understanding Recursion

**Recursion** is a programming technique where a function calls itself to solve a smaller instance of the same problem. Every recursive function needs a **base case** to stop the recursion, otherwise it runs infinitely, causing a stack overflow.

### The Classic Example: Factorial
To find the factorial of $n$ (written as $n!$), we multiply all integers from $1$ to $n$.
Mathematically: $n! = n \\times (n-1)!$ with $0! = 1$ (base case).

\`\`\`javascript
function factorial(n) {
  // Base case: stop when n is 0 or 1
  if (n <= 1) return 1;
  // Recursive case: call itself with n-1
  return n * factorial(n - 1);
}

console.log(factorial(5)); // Output: 120
\`\`\`

## 📝 Summary
Recursion breaks down a problem into smaller sub-problems of the same type, solved by a function calling itself until it reaches a base case.

## 🔑 Key Takeaways
- Requires a **Base Case** to stop.
- Requires a **Recursive Step** to make progress toward the base case.
- Uses the **Call Stack** behind the scenes.

## 🌍 Real World Analogy
Think of a Russian Matryoshka doll. To get to the smallest doll (base case), you keep opening a larger doll (recursive case) that contains a slightly smaller version of itself.

## 🧠 Memory Trick
**R**ecursion: **R**epeatedly **E**xecuting **C**odes **U**ntil **R**eaching **S**topping **I**nstructions **O**n **N**umber.`,
    quiz: {
      mcq: [
        { id: 1, question: "What is the primary purpose of a base case in recursion?", options: ["A) To start the recursion", "B) To store intermediate values", "C) To stop the recursion and prevent stack overflow", "D) To increase execution speed"], correct: "C", explanation: "The base case acts as the exit condition. Without it, the function would keep calling itself infinitely." },
        { id: 2, question: "What error occurs if a recursive function does not reach its base case?", options: ["A) Syntax Error", "B) Stack Overflow Error", "C) NullPointerException", "D) Out of Memory (Heap) Error"], correct: "B", explanation: "Infinite recursion consumes all available stack memory, triggering a stack overflow." },
        { id: 3, question: "Which data structure is used internally by the computer to manage recursive calls?", options: ["A) Queue", "B) Stack", "C) Tree", "D) Heap"], correct: "B", explanation: "The system call stack keeps track of active subroutines, saving their execution states." },
        { id: 4, question: "What is the factorial of 4 (4!) computed recursively?", options: ["A) 12", "B) 24", "C) 16", "D) 8"], correct: "B", explanation: "4! = 4 * 3 * 2 * 1 = 24." },
        { id: 5, question: "When should you prefer iteration over recursion?", options: ["A) When memory efficiency is critical", "B) When code readability is the only goal", "C) When solving tree-traversal problems", "D) When code needs to be as short as possible"], correct: "A", explanation: "Iteration doesn't add call frames to the stack, making it more memory-efficient than recursion in many languages." }
      ],
      trueFalse: [
        { id: 6, statement: "Every recursive function can also be written using loops (iteration).", correct: true, explanation: "Yes, recursion and iteration are computationally equivalent. Any recursive function can be converted to an iterative one using an explicit stack." },
        { id: 7, statement: "Recursion always uses less memory than iteration.", correct: false, explanation: "No, recursion typically uses more memory due to the overhead of storing stack frames for each call." }
      ],
      fillBlanks: [
        { id: 8, sentence: "The two essential parts of a recursive function are the ___ case and the ___ case.", blanks: ["base", "recursive"], explanation: "A recursive function needs a base case to stop and a recursive case to call itself." },
        { id: 9, sentence: "Infinite recursion leads to a ___ ___ error.", blanks: ["stack", "overflow"], explanation: "Running out of stack space triggers a stack overflow." }
      ],
      scenario: {
        id: 10,
        scenario: "You are implementing a file search utility that needs to traverse all subfolders inside a root folder to find a specific file.",
        question: "Why is recursion suitable here, and what is the base case?",
        expectedAnswer: "Recursion is suitable because file systems are hierarchical (tree-like structures) where folders contain subfolders. The base case is reaching a folder that has no subfolders, or finding the file itself.",
        keyPoints: ["Hierarchical structure traversal", "Base case is finding file or empty folder", "Self-similar subproblems"]
      }
    },
    notes: {
      revision: `### Revision Notes: Recursion
- **Definition**: A function calling itself.
- **Key Anatomy**:
  - **Base Case**: The conditional statement that stops the function from executing further.
  - **Recursive Step**: The call to the function itself with modified arguments (moving closer to the base case).
- **Execution Cost**: High stack memory usage, slower execution due to context switching between call frames.`,
      bullet: `- **Recursion**: Function calls itself.
- **Base Case**: Crucial to prevent infinite loops (Stack Overflow).
- **Equivalent**: Can always be rewritten iteratively.
- **Use Cases**: Best for tree/graph traversal, divide-and-conquer algorithms (QuickSort, MergeSort).`,
      formula: `### Mathematical Representation of Recursion
Let $T(n)$ represent the time complexity:
- **Factorial**: $T(n) = T(n-1) + O(1) \\implies O(n)$
- **Fibonacci**: $T(n) = T(n-1) + T(n-2) + O(1) \\implies O(2^n)$
- **Merge Sort**: $T(n) = 2T(n/2) + O(n) \\implies O(n \\log n)$`,
      flashcard: `**Q: What is a Stack Overflow?**
A: An error that occurs when the call stack runs out of memory, usually due to infinite recursion without reaching a base case.

**Q: How does recursion differ from iteration?**
A: Recursion solves problems via self-calling functions and call stack tracking, while iteration uses loops (for/while) and counter variables.`
    },
    followUps: [
      "What is the difference between direct and indirect recursion?",
      "How does compiler optimization like Tail Call Optimization (TCO) work?",
      "Can you explain the call stack limit in JavaScript?",
      "How would you solve the Fibonacci sequence recursively vs iteratively?"
    ]
  },
  "What is Newton's Second Law?": {
    answer: `## Newton's Second Law of Motion

Newton's Second Law states that the acceleration of an object is directly proportional to the net force acting on it, and inversely proportional to its mass.

$$F = m \\cdot a$$

Where:
- $F$ is the net force applied (Newtons, N)
- $m$ is the mass of the object (kilograms, kg)
- $a$ is the acceleration (meters per second squared, $m/s^2$)

### Example Calculation
If you push a toy car of mass 2 kg with a force of 10 N, its acceleration will be:
$$a = \\frac{F}{m} = \\frac{10}{2} = 5 \\text{ m/s}^2$$

## 📝 Summary
Force equals mass times acceleration. The heavier an object is, the more force it takes to accelerate it.

## 🔑 Key Takeaways
- Acceleration depends on Net Force and Mass.
- Doubling force doubles acceleration.
- Doubling mass halves acceleration.

## 🌍 Real World Analogy
Pushing an empty shopping cart is easy and accelerates it quickly. Pushing a fully loaded, heavy shopping cart with the same force accelerates it much slower.

## 🧠 Memory Trick
Remember **FMA**: **F**orce **M**eets **A**cceleration!`,
    quiz: {
      mcq: [
        { id: 1, question: "What is the formula representing Newton's Second Law?", options: ["A) F = m + a", "B) F = m/a", "C) F = m * a", "D) F = a/m"], correct: "C", explanation: "Force equals Mass times Acceleration." },
        { id: 2, question: "If the net force acting on an object is doubled, what happens to its acceleration (assuming mass is constant)?", options: ["A) It remains the same", "B) It is halved", "C) It is doubled", "D) It is quadrupled"], correct: "C", explanation: "Acceleration is directly proportional to force." },
        { id: 3, question: "What is the standard unit of force in the SI system?", options: ["A) Joule", "B) Newton", "C) Watt", "D) Pascal"], correct: "B", explanation: "The SI unit of force is the Newton (N)." },
        { id: 4, question: "An object with a mass of 10 kg is accelerated at 3 m/s². What net force is acting on it?", options: ["A) 3.33 N", "B) 13 N", "C) 30 N", "D) 7 N"], correct: "C", explanation: "F = m * a = 10 * 3 = 30 N." },
        { id: 5, question: "Why does a heavy truck require more distance to stop than a light car traveling at the same speed?", options: ["A) It has less gravity", "B) It has greater inertia due to more mass, requiring more force to decelerate", "C) It has better brakes", "D) It has less friction"], correct: "B", explanation: "More mass means more inertia, which means more force (or distance) is required to produce the same deceleration." }
      ],
      trueFalse: [
        { id: 6, statement: "An object with zero net force acting on it must be at rest.", correct: false, explanation: "An object with zero net force can be at rest OR moving at a constant velocity in a straight line (Newton's First Law)." },
        { id: 7, statement: "Mass and acceleration have an inverse relationship under constant force.", correct: true, explanation: "Under constant force, a greater mass results in smaller acceleration (a = F/m)." }
      ],
      fillBlanks: [
        { id: 8, sentence: "Acceleration is ___ proportional to force and ___ proportional to mass.", blanks: ["directly", "inversely"], explanation: "More force means more acceleration; more mass means less acceleration." },
        { id: 9, sentence: "One Newton is equal to one ___ times meter per second squared.", blanks: ["kilogram"], explanation: "1 N = 1 kg * m/s²." }
      ],
      scenario: {
        id: 10,
        scenario: "An astronaut pushes a tool box of mass 5 kg in outer space (where gravity and friction are negligible) with a force of 15 N.",
        question: "Calculate the acceleration of the box, and describe its speed after the force stops acting on it.",
        expectedAnswer: "The acceleration is a = F/m = 15/5 = 3 m/s². When the force stops, the box will continue moving at a constant speed in a straight line forever due to inertia (no net force).",
        keyPoints: ["Acceleration = 3 m/s²", "Constant velocity after force stops", "No deceleration because of zero friction"]
      }
    },
    notes: {
      revision: `### Revision Notes: Newton's Second Law
- **Formula**: $F = ma$
- **Units**: Force (N), Mass (kg), Acceleration ($m/s^2$)
- **Core Principle**: Force causes acceleration. Mass resists acceleration (inertia).
- **Friction**: In real life, friction is a opposing force that must be subtracted from the applied force to find the *net* force.`,
      bullet: `- **Second Law**: $F = ma$
- **Force**: Action that changes state of motion.
- **Mass**: Measure of inertia (resistance to acceleration).
- **Direct relationship**: Force $\\propto$ Acceleration.
- **Inverse relationship**: Mass $\\propto 1/$ Acceleration.`,
      formula: `### Key Formulas: Newton's Laws
- **Net Force**: $\\Sigma F = m \\cdot a$
- **Weight**: $W = m \\cdot g$ (where $g \\approx 9.8 \\text{ m/s}^2$)
- **Momentum Relation**: $F = \\frac{dp}{dt}$ where $p = mv$ (Force is rate of change of momentum)`,
      flashcard: `**Q: What is inertia?**
A: The tendency of an object to resist changes in its state of motion, directly proportional to its mass.

**Q: If you apply a 12N force to a 4kg block, what is its acceleration?**
A: a = F/m = 12 / 4 = 3 m/s².`
    },
    followUps: [
      "What is the difference between mass and weight?",
      "How does friction affect Newton's Second Law calculations?",
      "What is Newton's First Law (Law of Inertia)?",
      "Can you explain Newton's Third Law with examples?"
    ]
  }
}

// Fallback canned response keys
const DEFAULT_CANNED_KEYS = [
  "How does photosynthesis work?",
  "What is the difference between stack and queue?",
  "Explain time complexity in Big O notation",
  "What are React hooks and why use them?",
  "Explain SQL joins with examples",
  "What is machine learning?",
  "How does TCP/IP work?",
  "Explain inheritance in OOP"
]

// Populating default answers to make the app feel incredibly detailed
CANNED_RESPONSES["How does photosynthesis work?"] = {
  answer: `## How Photosynthesis Works

**Photosynthesis** is the process by which green plants, algae, and some bacteria convert light energy into chemical energy, using water and carbon dioxide to produce oxygen and glucose.

### The Chemical Equation
$$6\\text{CO}_2 + 6\\text{H}_2\\text{O} + \\text{Light Energy} \\rightarrow \\text{C}_6\\text{H}_{12}\\text{O}_6 + 6\\text{O}_2$$

### Two Main Stages
1. **Light-Dependent Reactions**: Occur in the thylakoid membranes of chloroplasts. Light energy is captured by chlorophyll and converted into ATP and NADPH, releasing oxygen.
2. **Light-Independent Reactions (Calvin Cycle)**: Occur in the stroma. ATP and NADPH are used to fix carbon dioxide into glucose.

## 📝 Summary
Plants absorb sunlight, water, and CO2 to create food (glucose) and release oxygen as a byproduct.

## 🔑 Key Takeaways
- Chloroplasts are the cellular solar panels.
- Chlorophyll pigment absorbs red and blue light, reflecting green.
- Glucose is stored as starch or used for energy.

## 🌍 Real World Analogy
Think of photosynthesis like a solar-powered kitchen. Sun is the power supply, carbon dioxide and water are raw ingredients, chlorophyll is the stove, glucose is the food, and oxygen is the exhaust.

## 🧠 Memory Trick
**L**ight reaction gives **L**ife (Oxygen), **C**alvin cycle makes **C**arbs (Glucose).`,
  quiz: {
    mcq: [
      { id: 1, question: "Which cellular organelle is the site of photosynthesis?", options: ["A) Mitochondria", "B) Chloroplast", "C) Ribosome", "D) Lysosome"], correct: "B", explanation: "Chloroplasts contain chlorophyll and host photosynthesis." },
      { id: 2, question: "What pigment absorbs light in plants?", options: ["A) Carotenoid", "B) Chlorophyll", "C) Hemoglobin", "D) Melanin"], correct: "B", explanation: "Chlorophyll is the primary photosynthetic pigment." },
      { id: 3, question: "What are the primary products of photosynthesis?", options: ["A) Carbon dioxide and water", "B) Glucose and oxygen", "C) ATP and NADPH", "D) Nitrogen and starch"], correct: "B", explanation: "The main products are glucose (sugar) and oxygen." },
      { id: 4, question: "Where do light-independent reactions (Calvin Cycle) occur?", options: ["A) Thylakoids", "B) Stroma", "C) Cytoplasm", "D) Matrix"], correct: "B", explanation: "The Calvin Cycle takes place in the stroma of chloroplasts." },
      { id: 5, question: "What gas do plants absorb from the atmosphere for photosynthesis?", options: ["A) Oxygen", "B) Nitrogen", "C) Carbon dioxide", "D) Hydrogen"], correct: "C", explanation: "Plants absorb carbon dioxide (CO2)." }
    ],
    trueFalse: [
      { id: 6, statement: "Light-dependent reactions require water to produce oxygen.", correct: true, explanation: "Water molecules are split (photolysis) to replace electrons, releasing oxygen gas." },
      { id: 7, statement: "Photosynthesis occurs in plant cells at night.", correct: false, explanation: "Photosynthesis requires light energy, so the light-dependent reactions cannot proceed without sunlight." }
    ],
    fillBlanks: [
      { id: 8, sentence: "Light reactions take place in the ___ membranes, while the Calvin Cycle takes place in the ___.", blanks: ["thylakoid", "stroma"], explanation: "Structure matters: thylakoids host light capture, stroma hosts carbon fixation." },
      { id: 9, sentence: "The chemical energy carriers produced in light reactions are ___ and ___.", blanks: ["ATP", "NADPH"], explanation: "These carry chemical energy to power the Calvin Cycle." }
    ],
    scenario: {
      id: 10,
      scenario: "You place a plant in a sealed glass jar with sufficient water but block all light for two weeks.",
      question: "What happens to the oxygen levels inside the jar and why?",
      expectedAnswer: "Oxygen levels will decrease because the plant cannot perform photosynthesis without light, but it will continue cellular respiration, consuming oxygen and producing carbon dioxide.",
      keyPoints: ["No photosynthesis without light", "Respiration consumes oxygen", "Oxygen levels drop"]
    }
  },
  notes: {
    revision: "### Revision Notes: Photosynthesis\n- **Formula**: $6\\text{CO}_2 + 6\\text{H}_2\\text{O} \\rightarrow \\text{C}_6\\text{H}_{12}\\text{O}_6 + 6\\text{O}_2$\n- **Chloroplast Anatomy**: Thylakoids (grana stack) and Stroma fluid.",
    bullet: "- Sun provides photons.\n- Water split $\\rightarrow$ releases O2.\n- Calvin Cycle fixes CO2 into sugars.",
    formula: "Light energy conversions: $ADP + Pi \\rightarrow ATP$, $NADP^+ + H^+ + 2e^- \\rightarrow NADPH$.",
    flashcard: "Q: What is photolysis?\nA: The splitting of water molecules using light energy during the light-dependent reactions."
  },
  followUps: [
    "What is the difference between C3, C4, and CAM plants?",
    "How does light intensity affect the rate of photosynthesis?",
    "What is cellular respiration and how does it relate?",
    "What role does stomata play in carbon dioxide absorption?"
  ]
}

CANNED_RESPONSES["What is the difference between stack and queue?"] = {
  answer: `## Stack vs Queue Data Structures

Both **Stacks** and **Queues** are linear data structures used to store collections of elements, but they differ fundamentally in their access order.

| Feature | Stack | Queue |
|---|---|---|
| **Ordering** | **LIFO** (Last In, First Out) | **FIFO** (First In, First Out) |
| **Insert Operation** | **Push** (adds to the top) | **Enqueue** (adds to the rear) |
| **Remove Operation**| **Pop** (removes from the top) | **Dequeue** (removes from the front) |
| **Analogy** | A stack of dinner plates | A line at a ticket counter |

### Visual Representation
- **Stack**: \`[Top] Element C -> Element B -> Element A [Bottom]\`
- **Queue**: \`[Front] Element A <- Element B <- Element C [Rear]\`

\`\`\`javascript
// Stack implementation using Array
const stack = [];
stack.push(1); // [1]
stack.push(2); // [1, 2]
stack.pop();    // Returns 2, stack is [1]

// Queue implementation using Array
const queue = [];
queue.push(1); // Enqueue: [1]
queue.push(2); // Enqueue: [1, 2]
queue.shift();  // Dequeue: Returns 1, queue is [2]
\`\`\`

## 📝 Summary
Stacks follow LIFO (Last In, First Out), removing the most recently added element. Queues follow FIFO (First In, First Out), removing the oldest element first.

## 🔑 Key Takeaways
- Stacks: Top element access only.
- Queues: Front (removal) and Rear (insertion) access.
- Both operations are $O(1)$ time complexity.

## 🌍 Real World Analogy
A stack is like a stack of trays in a cafeteria—you take the one from the top. A queue is like a queue of people waiting for a bus—the first person in line gets on the bus first.

## 🧠 Memory Trick
**S**tack = **S**tack of plates (LIFO). **Q**ueue = **Q**ueue of people (FIFO).`,
  quiz: {
    mcq: [
      { id: 1, question: "Which ordering principle does a stack follow?", options: ["A) FIFO", "B) LIFO", "C) LILO", "D) Random Access"], correct: "B", explanation: "Stacks follow Last In, First Out (LIFO)." },
      { id: 2, question: "Which operation adds an element to a queue?", options: ["A) Push", "B) Pop", "C) Enqueue", "D) Dequeue"], correct: "C", explanation: "Enqueue inserts elements at the rear of a queue." },
      { id: 3, question: "If you push A, B, and C onto a stack, which is removed first during a pop?", options: ["A) A", "B) B", "C) C", "D) None of the above"], correct: "C", explanation: "C was pushed last, so it is popped first (LIFO)." },
      { id: 4, question: "What is the time complexity of pushing onto a stack or enqueuing to a queue?", options: ["A) O(log n)", "B) O(n)", "C) O(1)", "D) O(n log n)"], correct: "C", explanation: "Both push and enqueue take constant time O(1)." },
      { id: 5, question: "Which of the following is a common application of a stack?", options: ["A) Print queue management", "B) Undo/Redo mechanism in text editors", "C) CPU scheduling", "D) Breadth-First Search (BFS)"], correct: "B", explanation: "Undo operations trace backwards through history, matching LIFO behavior." }
    ],
    trueFalse: [
      { id: 6, statement: "A standard queue allows you to insert elements in the middle.", correct: false, explanation: "No, queues only allow insertion at the rear." },
      { id: 7, statement: "Depth-First Search (DFS) typically uses a stack, while Breadth-First Search (BFS) uses a queue.", correct: true, explanation: "Yes, stack fits depth exploration, queue fits level exploration." }
    ],
    fillBlanks: [
      { id: 8, sentence: "Stack is to ___ as Queue is to ___.", blanks: ["LIFO", "FIFO"], explanation: "Last In First Out vs First In First Out." },
      { id: 9, sentence: "Removing an element from a stack is called ___.", blanks: ["pop"], explanation: "Pop removes from the top of the stack." }
    ],
    scenario: {
      id: 10,
      scenario: "You are designing an undo feature for a canvas drawing application and a printer jobs management system.",
      question: "Which data structure would you choose for each and why?",
      expectedAnswer: "Use a Stack for the drawing app's undo feature because you want to undo the most recent action first (LIFO). Use a Queue for the printer job system because print jobs should be completed in the order they were submitted (FIFO).",
      keyPoints: ["Stack for undo (LIFO)", "Queue for printer (FIFO)", "Justify access patterns"]
    }
  },
  notes: {
    revision: "### Stack and Queue Comparison\n- Stack: LIFO, Push/Pop operations, Undo/Call Stacks.\n- Queue: FIFO, Enqueue/Dequeue operations, Print Queues/BFS.",
    bullet: "- Stack: push/pop from top.\n- Queue: enqueue at back, dequeue from front.\n- Both have O(1) basic operations.",
    formula: "Stack/Queue size limit: $N$. Underflow: pop on empty ($size = 0$). Overflow: push on full ($size = N$).",
    flashcard: "Q: What is double-ended queue (Deque)?\nA: A queue where elements can be added or removed from both the front and rear."
  },
  followUps: [
    "How do you implement a queue using two stacks?",
    "What is a priority queue and how does it differ from a standard queue?",
    "How does memory allocation differ in stack vs heap?",
    "What is a circular queue?"
  ]
}

// Generate rest of the CANNED responses lazily or generate a robust custom response generator
export function getMockResponse(question: string, subject: string, mode: string = 'standard', style: string = 'teacher', difficulty: string = 'beginner') {
  // If we have an exact canned match, use it!
  const cleanedQ = question.trim().toLowerCase();
  for (const key of Object.keys(CANNED_RESPONSES)) {
    if (cleanedQ.includes(key.toLowerCase()) || key.toLowerCase().includes(cleanedQ)) {
      const resp = CANNED_RESPONSES[key];
      // Try to return the requested note type if applicable
      return resp;
    }
  }

  // Generic generator for questions that are not pre-canned
  const isCodingSubject = [
    'computer science', 'react', 'python', 'java', 'c', 'c++', 'javascript', 'typescript',
    'html', 'css', 'sql', 'dbms', 'operating systems', 'computer networks', 'data structures',
    'algorithms', 'artificial intelligence', 'machine learning', 'deep learning', 'cloud computing'
  ].includes(subject.toLowerCase());

  let practicalSection = '';
  if (isCodingSubject) {
    practicalSection = `### Practical Code / Scenario
\`\`\`javascript
// Demonstration of ${question}
function demonstrateConcept() {
  console.log("Analyzing ${question} in ${subject}");
  return { success: true, timestamp: Date.now() };
}
demonstrateConcept();
\`\`\``;
  } else if (subject.toLowerCase() === 'mathematics') {
    practicalSection = `### Mathematical Formulation & Example
When solving problems related to **${question}**, we use mathematical relationships and formulas. 

For instance, if we model this topic as a function of its variables:
$$f(x) = \\text{Value}(x) + C$$

Where:
- $x$ is the variable under consideration.
- $C$ is the constant or base parameter.
- $f(x)$ is the calculated output.

**Step-by-Step Practice Strategy:**
1. Identify all given values and variables.
2. Select the appropriate formula.
3. Substitute the values and compute the result step-by-step.`;
  } else {
    practicalSection = `### Conceptual Scenario / Example
**Scenario:**
Consider how this topic is applied in real-life research or study. When analyzing **${question}**, scholars observe its occurrence under controlled conditions.

**Key steps to study this:**
1. **Observation**: Notice the baseline conditions.
2. **Experimentation / Analysis**: Collect data points.
3. **Conclusion**: Interpret the findings in the context of **${subject}**.`;
  }

  const mockAnswer = `## Detailed Explanation of ${question}

This is a comprehensive study resource for **${question}** under the subject **${subject}**.

### Fundamental Overview
In **${subject}**, understanding **${question}** is essential for mastering advanced concepts. It provides the foundation for designing efficient systems and solving real-world challenges.

### Core Key Concepts
1. **Core Principle**: The fundamental concept governing this topic.
2. **Implementation & Practice**: How engineers and scholars apply this concept.
3. **Common Pitfalls**: Things to watch out for, such as edge cases or misapplications.

${practicalSection}

## 📝 Summary
Understanding ${question} helps build a robust knowledge base in ${subject}, addressing its core mechanism and primary use cases.

## 🔑 Key Takeaways
- Crucial component of ${subject}.
- Highly relevant for examinations and interviews.
- Best mastered through consistent practice and revision.

## 🌍 Real World Analogy
Think of this like a GPS navigation system. It takes complex map data, processes your destination, and guides you step-by-step to avoid traffic.

## 🧠 Memory Trick
Remember: **L**earn, **A**pply, **R**evise, **G**row (**LARG**)!`;

  const mockQuiz = {
    mcq: [
      { id: 1, question: `Which of the following best defines ${question}?`, options: [`A) A basic concept in ${subject}`, `B) A deprecated framework`, `C) A hardware device`, `D) None of the above`], correct: "A", explanation: `Correct because ${question} is a fundamental concept in ${subject}.` },
      { id: 2, question: `What is the primary benefit of studying ${question}?`, options: ["A) Increased complexity", "B) Better conceptual clarity and problem-solving skills", "C) Unnecessary boilerplate", "D) Higher licensing costs"], correct: "B", explanation: "Deep understanding simplifies problem-solving." },
      { id: 3, question: `What is a common pitfall when working with ${question}?`, options: ["A) Forgetting fundamental rules", "B) Writing too many comments", "C) Using modern tools", "D) Learning too quickly"], correct: "A", explanation: "Most errors occur due to weak fundamentals." },
      { id: 4, question: "In a professional environment, how is this concept viewed?", options: ["A) As a minor detail", "B) As a crucial standard practice", "C) As an outdated trick", "D) As a trade secret"], correct: "B", explanation: "Industry standards rely heavily on these core principles." },
      { id: 5, question: "Which skill is most complementary to this topic?", options: ["A) Critical thinking", "B) Mechanical typing", "C) Rote memorization", "D) None of the above"], correct: "A", explanation: "Critical thinking helps apply the concept to novel problems." }
    ],
    trueFalse: [
      { id: 6, statement: `${question} is only useful for beginners.`, correct: false, explanation: `No, ${question} is fundamental and remains vital even in advanced applications.` },
      { id: 7, statement: `Proper application of ${question} can lead to significant efficiency improvements.`, correct: true, explanation: "Optimizing according to these principles speeds up execution and saves resources." }
    ],
    fillBlanks: [
      { id: 8, sentence: `The core objective of ${question} is to solve problems in the field of ___.`, blanks: [subject.toLowerCase()], explanation: `It directly addresses problems in ${subject}.` },
      { id: 9, sentence: "To master this topic, one must combine theory with ___.", blanks: ["practice"], explanation: "Theory establishes the rules, practice establishes the execution." }
    ],
    scenario: {
      id: 10,
      scenario: `You are asked to explain ${question} to a client or stakeholder who has no background in ${subject}.`,
      question: "How would you structure your non-technical explanation?",
      expectedAnswer: "I would use a simple real-world analogy, avoid technical jargon, explain the high-level benefits, and demonstrate a quick concrete example.",
      keyPoints: ["Avoid jargon", "Use real-world analogy", "Focus on high-level value"]
    }
  };

  const mockNotes: Record<string, string> = {
    revision: `### Revision Notes: ${question}\n- Study of ${question} in the context of ${subject}.\n- Focus on core parameters, implementation, and standard behaviors.`,
    bullet: `- Core topic: ${question}.\n- Belongs to: ${subject}.\n- Practical focus: High efficiency and solid foundations.`,
    formula: `### Mathematical Representation\nLet $X$ be the variable representation of ${question}. The function $F(X) \\rightarrow \\text{Success}$.`,
    flashcard: `Q: What is the main idea behind ${question}?\nA: To provide a structured approach to solving problems in ${subject}.`
  };

  const mockFollowUps = [
    `How does ${question} relate to other topics in ${subject}?`,
    `What are the advanced applications of ${question}?`,
    `Where can I find open-source projects using this?`,
    `What is the history behind ${question}?`
  ];

  return {
    answer: mockAnswer,
    quiz: mockQuiz,
    notes: mockNotes,
    followUps: mockFollowUps
  };
}
