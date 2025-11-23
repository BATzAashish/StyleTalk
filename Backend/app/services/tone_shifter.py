"""
Tone Shifting Service using Groq API
Real-time contextual tone transformation for text
"""
import os
from groq import Groq
from typing import Dict, Optional
from flask import current_app
from app.models.tone_cache import ToneCache
from datetime import datetime

class ToneShifterService:
    """Service for shifting text tone using Groq AI"""
    
    # Available tone presets
    TONE_PRESETS = {
        'professional': 'professional and business-like',
        'casual': 'casual and friendly',
        'formal': 'formal and polite',
        'friendly': 'warm and friendly',
        'confident': 'confident and assertive',
        'empathetic': 'empathetic and understanding',
        'enthusiastic': 'enthusiastic and energetic',
        'neutral': 'neutral and objective',
        'persuasive': 'persuasive and compelling',
        'concise': 'concise and to-the-point',
        'detailed': 'detailed and comprehensive',
        'humorous': 'light-hearted and humorous',
        'genz': 'Gen-Z style with modern slang, abbreviations like "ngl", "fr", "lowkey", "tbh", emojis, and trendy expressions. Adapt formality based on context: use "honestly" and "pretty cool" for professional, "omg" and "fr fr" for friends, "aww" and "miss you" for family. Keep it authentic and contextually appropriate.',
    }
    
    def __init__(self, api_key: Optional[str] = None, model: Optional[str] = None, db=None):
        """Initialize Groq client"""
        self.api_key = api_key or current_app.config.get('GROQ_API_KEY')
        self.model = model or current_app.config.get('GROQ_MODEL', 'llama-3.3-70b-versatile')
        self.db = db  # MongoDB database instance for caching
        self.use_cache = db is not None  # Enable cache if DB is provided
        
        if not self.api_key:
            raise ValueError("Groq API key is required")
        
        self.client = Groq(api_key=self.api_key)
    
    def shift_tone(
        self, 
        text: str, 
        target_tone: str, 
        context: Optional[str] = None,
        preserve_meaning: bool = True,
        temperature: float = 0.7,
        user_id: Optional[str] = None,
        use_cache: bool = True
    ) -> Dict[str, any]:
        """
        Shift the tone of input text
        
        Args:
            text: The input text to transform
            target_tone: The desired tone (e.g., 'professional', 'casual', 'formal')
            context: Optional context about the situation
            preserve_meaning: Whether to maintain the original meaning
            temperature: Creativity level (0.0-1.0)
            user_id: Optional user ID for personalized cache
            use_cache: Whether to use caching (default: True)
        
        Returns:
            Dict containing transformed text and metadata
        """
        try:
            print(f"[DEBUG] ToneShifter - Input: '{text[:50]}...', Tone: {target_tone}")
            
            # Check cache first if enabled
            if use_cache and self.use_cache:
                cache_key = ToneCache.generate_cache_key(text, target_tone, context)
                print(f"[DEBUG] Checking cache with key: {cache_key}")
                
                cached_result = self.db.tone_cache.find_one({
                    'cache_key': cache_key,
                    '$or': [
                        {'user_id': user_id},
                        {'user_id': None}  # Global cache
                    ],
                    'expires_at': {'$gt': datetime.utcnow()}
                })
                
                if cached_result:
                    print(f"[CACHE HIT] Using cached response")
                    ToneCache.increment_hit_count(self.db, cache_key)
                    response = cached_result['response']
                    response['cached'] = True
                    response['cache_hit_count'] = cached_result.get('hit_count', 0) + 1
                    return response
            
            # Get tone description
            tone_description = self.TONE_PRESETS.get(
                target_tone.lower(), 
                target_tone
            )
            print(f"[DEBUG] Tone description: {tone_description}")
            
            # Build system prompt
            system_prompt = self._build_system_prompt(
                tone_description, 
                preserve_meaning, 
                context
            )
            
            # Build user prompt
            user_prompt = f"Original text: {text}"
            
            print(f"[DEBUG] Calling Groq API with model: {self.model}")
            # Call Groq API
            response = self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_prompt}
                ],
                temperature=temperature,
                max_tokens=1024,
                top_p=1,
                stream=False
            )
            
            transformed_text = response.choices[0].message.content.strip()
            print(f"[DEBUG] Got response: '{transformed_text[:50]}...'")
            
            result = {
                'success': True,
                'original_text': text,
                'transformed_text': transformed_text,
                'target_tone': target_tone,
                'tone_description': tone_description,
                'model_used': self.model,
                'cached': False,
                'usage': {
                    'prompt_tokens': response.usage.prompt_tokens,
                    'completion_tokens': response.usage.completion_tokens,
                    'total_tokens': response.usage.total_tokens
                }
            }
            
            # Store in cache if enabled
            if use_cache and self.use_cache:
                try:
                    cache_doc = ToneCache.create(text, target_tone, result, context, user_id)
                    self.db.tone_cache.insert_one(cache_doc)
                    print(f"[CACHE] Stored response in cache")
                except Exception as cache_error:
                    print(f"[WARNING] Failed to cache response: {cache_error}")
            
            return result
            
        except Exception as e:
            print(f"[ERROR] ToneShifter exception: {str(e)}")
            import traceback
            traceback.print_exc()
            return {
                'success': False,
                'error': str(e),
                'original_text': text,
                'target_tone': target_tone
            }
    
    def batch_shift(
        self, 
        texts: list, 
        target_tone: str,
        context: Optional[str] = None
    ) -> list:
        """
        Shift tone for multiple texts
        
        Args:
            texts: List of input texts
            target_tone: The desired tone
            context: Optional context
        
        Returns:
            List of transformation results
        """
        results = []
        for text in texts:
            result = self.shift_tone(text, target_tone, context)
            results.append(result)
        return results
    
    def suggest_improvements(
        self, 
        text: str, 
        current_tone: str,
        target_audience: Optional[str] = None
    ) -> Dict[str, any]:
        """
        Analyze text and suggest tone improvements
        
        Args:
            text: The input text to analyze
            current_tone: The perceived current tone
            target_audience: Who the text is for
        
        Returns:
            Dict containing suggestions and analysis
        """
        try:
            system_prompt = f"""You are a communication expert. Analyze the given text and provide:
1. Tone assessment (identify the current tone)
2. Suggestions for improvement
3. Alternative phrasings for key parts
4. Recommended tone adjustments

Current perceived tone: {current_tone}
{f'Target audience: {target_audience}' if target_audience else ''}

Provide your analysis in a structured format."""

            response = self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": text}
                ],
                temperature=0.5,
                max_tokens=1024
            )
            
            analysis = response.choices[0].message.content.strip()
            
            return {
                'success': True,
                'original_text': text,
                'analysis': analysis,
                'current_tone': current_tone,
                'target_audience': target_audience
            }
            
        except Exception as e:
            return {
                'success': False,
                'error': str(e),
                'original_text': text
            }
    
    def _build_system_prompt(
        self, 
        tone_description: str, 
        preserve_meaning: bool,
        context: Optional[str]
    ) -> str:
        """Build the system prompt for tone shifting"""
        prompt = f"""You are an expert communication assistant specializing in tone adaptation.

Your task: Rewrite the given text in a {tone_description} tone.

Rules:
- Only return the rewritten text, nothing else
- Do not add explanations or comments
"""
        
        if preserve_meaning:
            prompt += "- Preserve the original meaning and key information\n"
        
        if context:
            prompt += f"- Context: {context}\n"
        
        prompt += """- Maintain appropriate length (similar to original)
- Use natural language
- Ensure grammatical correctness"""
        
        return prompt
    
    @classmethod
    def get_available_tones(cls) -> Dict[str, str]:
        """Get all available tone presets"""
        return cls.TONE_PRESETS
