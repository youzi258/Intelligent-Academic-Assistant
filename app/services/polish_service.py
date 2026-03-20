# -*- coding: utf-8 -*-
import os
import json
from openai import OpenAI


class PolishService:
    def __init__(
        self, api_key="", base_url="https://api.deepseek.com/v1", model="deepseek-reasoner"
    ):
        api_key = api_key or os.getenv("OPENAI_API_KEY", "")
        self.client = OpenAI(api_key=api_key, base_url=base_url)
        self.model = model
        # Load prompts from JSON file
        prompts_file = os.path.join(os.path.dirname(__file__), "prompts.json")
        with open(prompts_file, "r", encoding="utf-8") as f:
            self.prompts = json.load(f)

    def polish(self, text: str, polish_type: str, language: str):
        try:
            if polish_type == "Expression Polishing":
                if language == "Chinese":
                    prompt = self.prompts["expression_polishing_chinese"] + text
                else:
                    prompt = self.prompts["expression_polishing_english"] + text
            elif polish_type == "Logic Check":
                if language == "Chinese":
                    prompt = self.prompts["logic_check_chinese"] + text
                else:
                    prompt = self.prompts["logic_check_english"] + text
            elif polish_type == "Remove AI Flavor":
                if language == "Chinese":
                    prompt = self.prompts["remove_ai_flavor_chinese"] + text
                else:
                    prompt = self.prompts["remove_ai_flavor_english"] + text
            elif polish_type == "Translation (Chinese to English)":
                prompt = self.prompts["translation_chinese_to_english"] + text
            elif polish_type == "Translation (English to Chinese)":
                prompt = self.prompts["translation_english_to_chinese"] + text
            elif polish_type == "Abbreviation":
                if language == "Chinese":
                    prompt = self.prompts["abbreviation_chinese"] + text
                else:
                    prompt = self.prompts["abbreviation_english"] + text
            elif polish_type == "Expansion":
                if language == "Chinese":
                    prompt = self.prompts["expansion_chinese"] + text
                else:
                    prompt = self.prompts["expansion_english"] + text
            else:
                raise ValueError("Unsupported polish type")

            system_message = ""

            response = self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {"role": "system", "content": system_message},
                    {"role": "user", "content": prompt},
                ],
                temperature=0.3,
                max_tokens=2000,
            )

            result_content = response.choices[0].message.content

            if polish_type in [
                "Logic Check",
                "Remove AI Flavor",
                "Abbreviation",
                "Expansion",
            ]:
                separators = [
                    "\n\nRevised Text:\n\n",
                    "\nRevised Text:\n",
                    "\n\nRevised Text:\n",
                    "\nRevised Text:\n\n",
                    "\n\nPolished Text:\n\n",
                    "\nPolished Text:\n",
                    "\n\nPolished Text:\n",
                    "\nPolished Text:\n\n",
                ]

                found = False
                for separator in separators:
                    parts = result_content.split(separator)
                    if len(parts) == 2:
                        modification_log = parts[0]
                        polished_text = parts[1]
                        found = True
                        break

                if not found:
                    modification_log = result_content
                    polished_text = text
            else:
                modification_log = ""
                polished_text = result_content

            return {
                "original_text": text,
                "polished_text": polished_text,
                "modification_log": modification_log,
            }
        except Exception as e:
            if polish_type == "Logic Check":
                return {
                    "original_text": text,
                    "polished_text": f"[Mock Revised Result] {text}",
                    "modification_log": "Mock Logic Analysis:\n- Logical structure: The text presents a clear comparison between the Digital Palace Museum's use of technology and Chinese cultural products' global impact.\n- Logical issues: No major logical issues identified. The connection between the two examples could be strengthened.\n- Improvement suggestions: Consider adding a transitional phrase to better connect the two ideas and emphasize the shared theme of blending tradition with innovation.",
                }
            elif polish_type == "Remove AI Flavor":
                return {
                    "original_text": text,
                    "polished_text": f"[Mock Humanized Result] {text}",
                    "modification_log": "Mock AI Flavor Analysis:\n- AI patterns identified: Generic phrasing and overly formal structure.\n- Improvements made: Added more natural language flow, reduced formulaic expressions, and incorporated more conversational elements.\n- Result: The text now sounds more human-written while maintaining academic quality.",
                }
            elif polish_type == "Abbreviation":
                return {
                    "original_text": text,
                    "polished_text": f"[Mock Abbreviated Result] {text}",
                    "modification_log": "Mock Abbreviation Analysis:\n- Key information preserved: Core concepts of technology use in cultural preservation and global cultural impact.\n- Approach: Removed redundant phrases and streamlined sentence structure.\n- Result: The text is now more concise while maintaining all essential information.",
                }
            elif polish_type == "Expansion":
                return {
                    "original_text": text,
                    "polished_text": f"[Mock Expanded Result] {text}",
                    "modification_log": "Mock Expansion Analysis:\n- Areas expanded: Added specific examples of VR/AI applications in the Digital Palace Museum and details about 'Black Myth: Wukong's' global impact.\n- Approach: Provided contextual information to enhance understanding and depth.\n- Result: The text now offers more comprehensive information while maintaining logical flow.",
                }
            else:
                return {
                    "original_text": text,
                    "polished_text": f"[Mock Polished Result] {text}",
                    "modification_log": "Mock Modification Log",
                }
