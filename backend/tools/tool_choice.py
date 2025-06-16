from services.OpenAIService import ChatOpenAI # If tool_choice uses it directly
import json

def tool_choice(question, image, history, user_info, viewed_products, result_gg):
    print(f"Mock tool_choice called with question: {question}, image: {image is not None}, history_len: {len(history) if history else 0}")
    # Simulate a decision process, e.g., always pick 'find_product_to_image_or_text' if no specific logic.
    # In a real scenario, this function might call an LLM to decide.
    # The original code suggests this function itself calls ChatOpenAI.
    # For this mock, we'll return a predefined structure that the main chatbot logic expects.
    
    # messages_for_llm = message_prompt(question, image, history, user_info, viewed_products, result_gg)
    # Define mock tools that this decider LLM would choose from (simplified)
    # available_tools_for_llm = [
    #     {
    #         "type": "function",
    #         "function": {
    #             "name": "find_product_to_image_or_text",
    #             "description": "Searches for products based on image or text.",
    #             "parameters": { # Simplified params
    #                 "type": "object",
    #                 "properties": {
    #                     "keyword_form_gg": {"type": "string"},
    #                     "type_product": {"type": "string"}
    #                 },
    #                 "required": ["keyword_form_gg"]
    #             }
    #         }
    #     },
    #     # Add other tools if needed for more complex mock
    # ]
    # llm_response = ChatOpenAI(
    #     model="gpt-3.5-turbo", # or a decision-making specific model
    #     messages=messages_for_llm,
    #     tools=available_tools_for_llm,
    #     tool_choice="auto" # Let the LLM decide
    # )
    # if llm_response.choices[0].message.tool_calls:
    #     return llm_response.choices[0].message # This is what the main logic expects
    # else:
    #     # Fallback if LLM doesn't choose a tool
    #     return type('ResponseMessage', (), {'content': llm_response.choices[0].message.content, 'tool_calls': None})()

    # Simplified mock: always return a tool call for 'find_product_to_image_or_text'
    # or return a direct content response based on some condition.
    if "ảnh" in question or "hình" in question or image is not None:
        tool_function_name = "find_product_to_image_or_text"
        tool_arguments = {"keyword_form_gg": question, "type_product": "điện thoại"} # Example arguments
    elif "khuyến mãi" in question:
        tool_function_name = "promotion"
        tool_arguments = {}
    else:
        # Simulate no tool call, direct answer by first_message.content
        class MockToolChoiceResponseNoTool:
            def __init__(self):
                self.tool_calls = None
                self.content = "Xin chào! Tôi có thể giúp gì cho bạn về các sản phẩm điện máy?"
        print("Mock tool_choice: No specific tool, direct content response.")
        return MockToolChoiceResponseNoTool()

    class MockToolCall:
        def __init__(self, name, args):
            self.id = "call_mock123"
            self.type = "function"
            self.function = type('Function', (), {'name': name, 'arguments': json.dumps(args)})

    class MockToolChoiceResponseWithTool:
        def __init__(self):
            self.tool_calls = [MockToolCall(tool_function_name, tool_arguments)]
            self.content = None # No direct content if a tool is called
    
    print(f"Mock tool_choice: Selected tool '{tool_function_name}' with args {tool_arguments}")
    return MockToolChoiceResponseWithTool()

def message_prompt(question, image, history, user_info, viewed_products, result_gg):
    print(f"Mock message_prompt called for question: {question}")
    # This function should construct a list of messages for the LLM
    messages = []
    if history:
        messages.extend(history)
    messages.append({"role": "user", "content": question})
    if image:
        messages.append({"role": "user", "content": "[image_placeholder]"}) # Simplified
    # Add other context if provided
    # print(f"Mock message_prompt generated: {messages}")
    return messages 