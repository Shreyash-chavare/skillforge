import OpenAi from 'openai'

const openai=new OpenAi({apiKey:process.env.OPENAI_API_KEY || process.env.mykey})

export const generateTitles=async(topicname,difficulty)=>{
  const prompt = `
  You are a world-class curriculum architect and educational expert specializing in creating progressive learning paths.
  
  **Task**: Design a comprehensive, industry-standard learning curriculum for "${topicname}" at a "${difficulty}" proficiency level.
  
  **Requirements**:
  1. Generate 8-12 well-structured lesson titles that form a complete learning journey
  2. Each title should represent a distinct, actionable learning module
  3. Ensure smooth progression from foundational concepts to practical mastery
  4. Include hands-on projects, real-world applications, and best practices
  5. The final title should always be a capstone project that integrates all learned concepts
  
  **Difficulty-Specific Guidelines**:
  
  **Beginner Level**:
  - Start with "What is..." introduction and fundamental concepts
  - Focus on core terminology, basic operations, and simple examples
  - Include setup/installation guides where applicable
  - Break complex topics into digestible chunks
  - End with a simple hands-on project
  - Use encouraging, accessible language
  
  **Intermediate Level**:
  - Assume basic knowledge; skip elementary introductions
  - Cover practical workflows, common patterns, and best practices
  - Include real-world use cases and industry applications
  - Address common challenges and troubleshooting
  - Integrate multiple concepts into practical scenarios
  - End with a realistic project mimicking professional work
  
  **Advanced Level**:
  - Assume strong foundational knowledge
  - Focus on optimization, scalability, and advanced techniques
  - Cover architectural decisions, performance tuning, and edge cases
  - Include research topics, emerging trends, and expert-level patterns
  - Address system design and production-grade considerations
  - End with a complex, production-ready project
  
  **Output Format**:
  You MUST return a JSON object with a "titles" key containing an array of lesson objects.
  Each object in the array must have:
  - "title": A clear, descriptive lesson title (not generic)
  - "difficulty": Exactly one of: "beginner", "intermediate", or "advanced"
  
  **Quality Standards**:
  - Titles should be specific, not vague (e.g., "Building RESTful APIs with Authentication" not just "APIs")
  - Follow logical teaching order (prerequisites before advanced topics)
  - Include variety: theory, practical skills, projects, and best practices
  - Make titles actionable and outcome-focused
  - Ensure each title could realistically be a 20-45 minute lesson
  
  **Example for "React" at "intermediate" level**:
  {
    "titles": [
      { "title": "Component Architecture and Design Patterns", "difficulty": "intermediate" },
      { "title": "State Management with Context API and Reducers", "difficulty": "intermediate" },
      { "title": "React Hooks: Advanced Patterns and Custom Hooks", "difficulty": "intermediate" },
      { "title": "Performance Optimization: Memoization and Code Splitting", "difficulty": "intermediate" },
      { "title": "Building Forms with Validation and Error Handling", "difficulty": "intermediate" },
      { "title": "API Integration: Fetching and Managing Data", "difficulty": "intermediate" },
      { "title": "Testing React Applications with Jest and React Testing Library", "difficulty": "intermediate" },
      { "title": "Deployment Strategies and Production Best Practices", "difficulty": "intermediate" },
      { "title": "Project: Building a Full-Featured Dashboard Application", "difficulty": "intermediate" }
    ]
  }
  
  Now generate the curriculum for "${topicname}" at "${difficulty}" level.
  `;
    
     const completion=await openai.chat.completions.create({
        model:"gpt-4o-mini",
        messages:[{role:"user",content:prompt}],
        response_format:{type:"json_object"}
     });

     try {
        const content = completion?.choices?.[0]?.message?.content;
        //console.log("AI Response content:", content);
        let parsed;
        if (typeof content === 'string') {
          parsed = JSON.parse(content);
        } else {
          parsed = content;
        }

       // console.log("Parsed AI response:", JSON.stringify(parsed, null, 2));

       
        let items;
        if (Array.isArray(parsed)) {
          items = parsed;
        } else if (parsed && Array.isArray(parsed.titles)) {
          items = parsed.titles;
        } else if (parsed && Array.isArray(parsed.items)) {
          items = parsed.items;
        } else if (parsed && Array.isArray(parsed.data)) {
          items = parsed.data;
        } else if (parsed && typeof parsed === 'object') {
          // Sometimes returns an object with numeric keys
          const values = Object.values(parsed);
          items = values.every(v => typeof v === 'object') ? values : [];
        } else {
          items = [];
        }
        
        //console.log("Extracted items count:", items.length);

        
        const normalized = items
          .filter(it => it && (it.title || typeof it === 'string'))
          .map((it, idx) => {
            if (typeof it === 'string') {
              return { title: it, difficulty: (difficulty || 'beginner').toLowerCase() };
            }
            return {
              title: it.title,
              difficulty: (it.difficulty || difficulty || 'beginner').toLowerCase()
            };
          });

        if (normalized.length > 0) {
         // console.log(`Successfully generated ${normalized.length} titles for ${topicname}`);
          return normalized;
        }
      
        //console.warn(`AI returned no valid titles for ${topicname}. Using fallback.`);
        const level = (difficulty || 'beginner').toLowerCase();
        return [
          { title: `Introduction to ${topicname}`, difficulty: level },
          { title: `${topicname} Basics`, difficulty: level },
          { title: `${topicname} Hands-on`, difficulty: level },
          { title: `${topicname} Best Practices`, difficulty: level },
          { title: `${topicname} Project`, difficulty: level }
        ];
     } catch (e) {
        //console.error("Error parsing AI response for", topicname, ":", e);
        //console.error("Raw content that failed to parse:", completion?.choices?.[0]?.message?.content);
        const level = (difficulty || 'beginner').toLowerCase();
        return [
          { title: `Introduction to ${topicname}`, difficulty: level },
          { title: `${topicname} Basics`, difficulty: level },
          { title: `${topicname} Hands-on`, difficulty: level },
          { title: `${topicname} Best Practices`, difficulty: level },
          { title: `${topicname} Project`, difficulty: level }
        ];
     }   
};

export const generateContent=async(topicname,title,difficulty)=>{
     const prompt=`
     You are an expert content writer.
     Generate a paragraph of content for the title "${title}" of the topic "${topicname}" 
     tailored for a "${difficulty}" level learner.
     `
     const completion=await openai.chat.completions.create({
      model:"gpt-4o-mini",
      messages:[{role:"user",content:prompt}],
     })
     return completion.choices[0].message.content;
}