export async function* streamMessage(message: string, sessionId: string): AsyncGenerator<{ text: string }> {
  const response = await fetch('/api/chat', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ message, sessionId }),
  });

  if (!response.ok || !response.body) {
    const errorData = await response.json().catch(() => ({ error: "Failed to connect to Style Advisor."}));
    throw new Error(errorData.error || "An unknown error occurred while connecting to the chat service.");
  }
  
  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) {
      break;
    }

    buffer += decoder.decode(value, { stream: true });
    // SSE uses \n\n as a message separator
    const lines = buffer.split('\n\n');
    
    // The last part might be an incomplete message, so keep it in the buffer
    buffer = lines.pop() || '';

    for (const line of lines) {
      if (line.startsWith('data: ')) {
        const data = line.substring(6);
        try {
          if (data) yield JSON.parse(data);
        } catch (e) {
          console.error("Failed to parse stream chunk:", data, e);
        }
      }
    }
  }

  // Process any remaining data in the buffer
  if (buffer.startsWith('data: ')) {
      const data = buffer.substring(6).trim();
       try {
           if(data) yield JSON.parse(data);
        } catch(e) {
            console.error("Failed to parse final stream chunk:", data, e);
        }
  }
}
