import json

def ChatOpenAI(*args, **kwargs):
    model_name = kwargs.get("model", "unknown_model")
    print(f"Mock ChatOpenAI called with model: {model_name}, args: {args}, kwargs: {kwargs}")
    
    usage_stats = {"prompt_tokens": 10, "completion_tokens": 20, "total_tokens": 30}

    if kwargs.get("stream"):
        class MockStreamChoice:
            def __init__(self, content):
                self.delta = type('Delta', (), {'content': content})
        
        class MockStreamResponse:
            def __init__(self):
                self.choices = [MockStreamChoice(" streamed_response_chunk_1"), MockStreamChoice(" streamed_response_chunk_2")]
                self.usage = usage_stats
                self._iter_index = 0

            def __iter__(self):
                self._iter_index = 0
                return self

            def __next__(self):
                if self._iter_index < len(self.choices):
                    choice = self.choices[self._iter_index]
                    self._iter_index += 1
                    # Return a structure similar to actual OpenAI stream chunk
                    return type('Chunk', (), {'choices': [choice], 'usage': None})()
                else:
                    # After content, a final chunk with usage might appear in some SDK versions
                    # Or usage might be on the response object itself, accessed after iteration.
                    # For simplicity, we'll assume usage is accessed on the main response object later.
                    raise StopIteration
        
        # The ChatOpenAI function itself should return an iterable for streams
        return MockStreamResponse()

    class MockChoice:
        def __init__(self):
            # Default content if no tools are involved
            self.content = 'mock_openai_response_content'
            tool_calls_list = []
            if kwargs.get("tools"):
                 tool_calls_list.append(
                    type('ToolCall', (), {
                        'id': 'call_abc123',
                        'type': 'function',
                        'function': type('Function', (), {
                            'name': 'mock_function_from_openai',
                            'arguments': json.dumps({'arg1': 'value1', 'param2': 'value2'})
                        })
                    })
                )
            # If tool_choice is set (e.g. to a specific function), simulate that tool call
            if isinstance(kwargs.get("tool_choice"), dict) and kwargs["tool_choice"].get("type") == "function":
                func_spec = kwargs["tool_choice"].get("function", {})
                func_name = func_spec.get("name", "mock_chosen_function")
                tool_calls_list = [
                    type('ToolCall', (), {
                        'id': 'call_def456',
                        'type': 'function',
                        'function': type('Function', (), {
                            'name': func_name,
                            'arguments': json.dumps({'chosen_arg': 'chosen_val'}) # Default args for chosen function
                        })
                    })
                ]
                self.content = None # Usually no direct content if a tool is forced/called

            self.message = type('Message', (), {
                'tool_calls': tool_calls_list if tool_calls_list else None,
                'content': self.content
            })

    class MockResponse:
        def __init__(self):
            self.choices = [MockChoice()]
            self.usage = usage_stats
            # Expose tool_calls directly on the message for convenience if needed by calling code
            # This matches structure like: response.choices[0].message.tool_calls
            # self.message = self.choices[0].message 

    return MockResponse() 