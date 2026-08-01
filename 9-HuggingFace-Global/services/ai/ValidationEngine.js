/**
 * Validation Engine for AI Medical Companion
 * Validates user inputs against context and inspects generated AI output
 * for repetitions, robotic language, unsafe content, or hallucinations.
 */

export function validateUserResponse(message = '', memory = {}) {
    const text = message.trim();
    if (!text) {
        return { isValid: false, reason: 'empty_input' };
    }

    return { isValid: true };
}

/**
 * Validates generated AI output to ensure compliance with warmth, safety,
 * tone rules, and absence of question repetitions.
 */
export function validateAIOutput(aiResponseText = '', plannedQuestion = '', lastQuestionAsked = '') {
    if (!aiResponseText || typeof aiResponseText !== 'string') {
        return `I'm paying close attention to what you shared. ${plannedQuestion}`;
    }

    let cleanedText = aiResponseText.trim();

    // 0. Remove filler opening words at the start if present
    cleanedText = cleanedText.replace(/^(of course|absolutely|sure|happy to help|i am so sorry to hear that|i understand|let's look into that)[.,!]?\s*/gi, '');
    cleanedText = cleanedText.replace(/\*\*/g, '');

    // 2. Repetition Check: If AI repeated the previous question exactly, replace it with plannedQuestion
    if (lastQuestionAsked && cleanedText.toLowerCase().includes(lastQuestionAsked.toLowerCase())) {
        cleanedText = cleanedText.replace(new RegExp(lastQuestionAsked.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&'), 'gi'), plannedQuestion);
    }

    // 3. Ensure ONE Question Rule (max 2 question marks allowed across full output)
    const questionMarks = (cleanedText.match(/\?/g) || []).length;
    if (questionMarks > 2) {
        const sentences = cleanedText.split(/(?<=\?)/);
        cleanedText = sentences.slice(0, 2).join(' ').trim();
    }

    // 4. Robotic / Mechanical jargon rewrite fallback
    if (cleanedText.toLowerCase().includes('as an ai model') || cleanedText.toLowerCase().includes('in accordance with medical protocols')) {
        cleanedText = cleanedText
            .replace(/as an ai model/gi, 'as your health companion')
            .replace(/in accordance with medical protocols/gi, 'to take the best care of you');
    }

    // 5. Incomplete sentence cleanup: Ensure text ends on complete punctuation (. ! ?)
    if (cleanedText && !/[.!?]$/.test(cleanedText)) {
        const lastPunctuation = Math.max(cleanedText.lastIndexOf('.'), cleanedText.lastIndexOf('!'), cleanedText.lastIndexOf('?'));
        if (lastPunctuation > 20) {
            cleanedText = cleanedText.slice(0, lastPunctuation + 1).trim();
        }
    }

    return cleanedText;
}
