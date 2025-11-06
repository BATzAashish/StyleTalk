"""
NLP Service Module for StyleTalk
Handles all NLP-related processing including:
- Sentiment Analysis
- Emotion Detection
- Tone Analysis
- Context Understanding
- Text Generation with different styles
"""

import os
from textblob import TextBlob
from langdetect import detect, LangDetectException
from transformers import pipeline
import spacy
from openai import OpenAI
import re

class NLPService:
    def __init__(self):
        """Initialize NLP models and services"""
        
        # Initialize OpenAI client
        self.openai_client = OpenAI(api_key=os.environ.get('OPENAI_API_KEY', ''))
        
        # Initialize sentiment analysis model (Hugging Face)
        try:
            self.sentiment_analyzer = pipeline(
                "sentiment-analysis",
                model="distilbert-base-uncased-finetuned-sst-2-english"
            )
        except Exception as e:
            print(f"Warning: Could not load sentiment analyzer: {e}")
            self.sentiment_analyzer = None
        
        # Initialize emotion detection model
        try:
            self.emotion_detector = pipeline(
                "text-classification",
                model="j-hartmann/emotion-english-distilroberta-base",
                return_all_scores=True
            )
        except Exception as e:
            print(f"Warning: Could not load emotion detector: {e}")
            self.emotion_detector = None
        
        # Initialize spaCy for NER and text analysis
        try:
            self.nlp = spacy.load("en_core_web_sm")
        except Exception as e:
            print(f"Warning: Could not load spaCy model: {e}")
            print("Run: python -m spacy download en_core_web_sm")
            self.nlp = None
    
    def detect_language(self, text):
        """Detect the language of the input text"""
        try:
            lang = detect(text)
            return lang
        except LangDetectException:
            return "unknown"
    
    def analyze_sentiment(self, text):
        """Analyze sentiment using TextBlob and Transformers"""
        results = {
            'textblob': {},
            'transformer': {}
        }
        
        # TextBlob analysis
        blob = TextBlob(text)
        results['textblob'] = {
            'polarity': blob.sentiment.polarity,  # -1 to 1
            'subjectivity': blob.sentiment.subjectivity,  # 0 to 1
            'label': 'positive' if blob.sentiment.polarity > 0 else 'negative' if blob.sentiment.polarity < 0 else 'neutral'
        }
        
        # Transformer analysis
        if self.sentiment_analyzer:
            try:
                sentiment = self.sentiment_analyzer(text[:512])[0]  # Limit to 512 tokens
                results['transformer'] = sentiment
            except Exception as e:
                print(f"Transformer sentiment analysis error: {e}")
        
        return results
    
    def detect_emotions(self, text):
        """Detect emotions in the text"""
        if not self.emotion_detector:
            return []
        
        try:
            emotions = self.emotion_detector(text[:512])[0]
            # Sort by score and return top emotions
            sorted_emotions = sorted(emotions, key=lambda x: x['score'], reverse=True)
            return sorted_emotions[:3]  # Return top 3 emotions
        except Exception as e:
            print(f"Emotion detection error: {e}")
            return []
    
    def analyze_tone(self, text):
        """Analyze the tone of the text"""
        blob = TextBlob(text)
        
        # Determine tone based on sentiment and subjectivity
        polarity = blob.sentiment.polarity
        subjectivity = blob.sentiment.subjectivity
        
        if polarity > 0.5:
            tone = "enthusiastic"
        elif polarity > 0.2:
            tone = "positive"
        elif polarity > -0.2:
            tone = "neutral"
        elif polarity > -0.5:
            tone = "negative"
        else:
            tone = "critical"
        
        # Adjust based on subjectivity
        if subjectivity > 0.7:
            tone += " and emotional"
        elif subjectivity < 0.3:
            tone += " and factual"
        
        return {
            'tone': tone,
            'polarity': polarity,
            'subjectivity': subjectivity
        }
    
    def extract_context(self, text):
        """Extract context information from text using NER"""
        if not self.nlp:
            return {}
        
        doc = self.nlp(text)
        
        context = {
            'entities': [],
            'keywords': [],
            'sentence_count': len(list(doc.sents)),
            'word_count': len([token for token in doc if not token.is_punct])
        }
        
        # Extract named entities
        for ent in doc.ents:
            context['entities'].append({
                'text': ent.text,
                'label': ent.label_
            })
        
        # Extract keywords (nouns and proper nouns)
        keywords = [token.text for token in doc if token.pos_ in ['NOUN', 'PROPN'] and not token.is_stop]
        context['keywords'] = list(set(keywords))[:10]  # Top 10 unique keywords
        
        return context
    
    def detect_relationship_context(self, text):
        """Detect the relationship context (formal, casual, professional, friendly)"""
        text_lower = text.lower()
        
        # Formal indicators
        formal_words = ['sir', 'madam', 'hereby', 'pursuant', 'regarding', 'sincerely', 'respectfully']
        formal_score = sum(1 for word in formal_words if word in text_lower)
        
        # Casual indicators
        casual_words = ['hey', 'yeah', 'gonna', 'wanna', 'cool', 'awesome', 'lol', 'btw']
        casual_score = sum(1 for word in casual_words if word in text_lower)
        
        # Professional indicators
        professional_words = ['meeting', 'project', 'deadline', 'report', 'presentation', 'team']
        professional_score = sum(1 for word in professional_words if word in text_lower)
        
        # Friendly indicators
        friendly_words = ['friend', 'buddy', 'thanks', 'appreciate', 'glad', 'hope']
        friendly_score = sum(1 for word in friendly_words if word in text_lower)
        
        # Determine relationship
        scores = {
            'formal': formal_score,
            'casual': casual_score,
            'professional': professional_score,
            'friendly': friendly_score
        }
        
        relationship = max(scores, key=scores.get) if max(scores.values()) > 0 else 'neutral'
        
        return {
            'relationship': relationship,
            'scores': scores,
            'confidence': max(scores.values()) / (sum(scores.values()) + 1)
        }
    
    def generate_response(self, input_text, style='professional', context=None):
        """Generate a response using GPT with specified style"""
        
        # Style-specific prompts
        style_prompts = {
            'formal': "Rewrite the following message in a very formal, professional tone suitable for business correspondence:",
            'professional': "Rewrite the following message in a professional and polite tone:",
            'polite': "Rewrite the following message in a polite and courteous manner:",
            'casual': "Rewrite the following message in a casual, friendly tone:",
            'gen-z': "Rewrite the following message in a Gen-Z style with modern slang and expressions:",
            'friends': "Rewrite the following message as if talking to a close friend, warm and informal:",
        }
        
        prompt = style_prompts.get(style.lower(), style_prompts['professional'])
        
        # Add context if provided
        if context:
            sentiment = context.get('sentiment', {})
            emotion = context.get('emotion', [])
            if sentiment:
                prompt += f"\n\nOriginal sentiment: {sentiment.get('textblob', {}).get('label', 'neutral')}"
            if emotion and len(emotion) > 0:
                prompt += f"\nDetected emotion: {emotion[0].get('label', 'neutral')}"
        
        prompt += f"\n\nMessage: \"{input_text}\"\n\nRewritten message:"
        
        try:
            response = self.openai_client.chat.completions.create(
                model="gpt-3.5-turbo",
                messages=[
                    {"role": "system", "content": "You are StyleTalk AI, an expert in rewriting messages with different tones and styles while maintaining the core meaning. Be concise and natural."},
                    {"role": "user", "content": prompt}
                ],
                max_tokens=150,
                temperature=0.7
            )
            
            generated_text = response.choices[0].message.content.strip()
            return generated_text
        
        except Exception as e:
            print(f"OpenAI API error: {e}")
            # Fallback to rule-based generation
            return self._fallback_generation(input_text, style)
    
    def _fallback_generation(self, text, style):
        """Fallback text generation when API is unavailable"""
        
        fallback_responses = {
            'formal': f"Dear Sir/Madam,\n\n{text}\n\nRespectfully yours,",
            'professional': f"Hello,\n\n{text}\n\nBest regards,",
            'polite': f"Hi there,\n\n{text}\n\nThank you!",
            'casual': f"Hey! {text} 😊",
            'gen-z': f"yo! {text} fr fr 💯",
            'friends': f"Hey friend! {text} ✨",
        }
        
        return fallback_responses.get(style.lower(), text)
    
    def analyze_full_context(self, text):
        """Complete context analysis of the input text"""
        
        analysis = {
            'language': self.detect_language(text),
            'sentiment': self.analyze_sentiment(text),
            'emotions': self.detect_emotions(text),
            'tone': self.analyze_tone(text),
            'context': self.extract_context(text),
            'relationship': self.detect_relationship_context(text)
        }
        
        return analysis
    
    def generate_multiple_styles(self, input_text):
        """Generate responses in multiple styles"""
        
        # First analyze the context
        context = self.analyze_full_context(input_text)
        
        styles = ['formal', 'professional', 'polite', 'casual', 'gen-z', 'friends']
        responses = {}
        
        for style in styles:
            try:
                responses[style] = self.generate_response(input_text, style, context)
            except Exception as e:
                print(f"Error generating {style} style: {e}")
                responses[style] = self._fallback_generation(input_text, style)
        
        return {
            'context': context,
            'responses': responses
        }
    
    def analyze_message(self, message):
        """Analyze message for emotion, intent, and context"""
        sentiment = self.analyze_sentiment(message)
        emotions = self.detect_emotions(message)
        tone = self.analyze_tone(message)
        
        # Determine primary emotion
        primary_emotion = emotions[0]['label'] if emotions else 'neutral'
        
        # Determine intent (simple classification)
        intent = self._classify_intent(message)
        
        return {
            'emotion': primary_emotion,
            'intent': intent,
            'sentiment': sentiment['textblob']['label'],
            'tone': tone,
            'confidence': emotions[0]['score'] if emotions else 0.5
        }
    
    def _classify_intent(self, message):
        """Classify the intent of the message"""
        message_lower = message.lower()
        
        question_words = ['what', 'when', 'where', 'who', 'why', 'how', '?']
        if any(word in message_lower for word in question_words):
            return 'question'
        
        gratitude_words = ['thank', 'thanks', 'grateful', 'appreciate']
        if any(word in message_lower for word in gratitude_words):
            return 'gratitude'
        
        request_words = ['please', 'could you', 'would you', 'can you']
        if any(word in message_lower for word in request_words):
            return 'request'
        
        apology_words = ['sorry', 'apologize', 'regret', 'my bad']
        if any(word in message_lower for word in apology_words):
            return 'apology'
        
        return 'statement'
    
    def generate_styled_responses(self, message, relationship='professional'):
        """Generate multiple styled responses based on relationship context"""
        
        # Map relationships to styles
        relationship_style_map = {
            'professional': ['formal', 'professional'],
            'client': ['formal', 'professional', 'polite'],
            'colleague': ['professional', 'polite', 'casual'],
            'friend': ['casual', 'friends'],
            'family': ['casual', 'friends']
        }
        
        styles = relationship_style_map.get(relationship, ['professional', 'polite', 'casual'])
        
        # Add gen-z style for casual relationships
        if relationship in ['friend', 'family']:
            styles.append('gen-z')
        
        responses = []
        for style in styles[:4]:  # Limit to 4 responses
            generated = self.generate_response(message, style)
            
            # Add metadata
            response_data = {
                'style': style.capitalize(),
                'content': generated,
                'color': self._get_style_color(style),
                'isRecommended': style in ['professional', 'polite']
            }
            responses.append(response_data)
        
        return responses
    
    def _get_style_color(self, style):
        """Get color scheme for different styles"""
        color_map = {
            'formal': 'blue',
            'professional': 'indigo',
            'polite': 'green',
            'casual': 'purple',
            'gen-z': 'pink',
            'friends': 'orange'
        }
        return color_map.get(style, 'gray')
    
    def correct_grammar(self, text):
        """Correct grammar and spelling errors"""
        blob = TextBlob(text)
        corrected = str(blob.correct())
        
        # Find differences
        corrections = []
        if corrected != text:
            corrections.append({
                'original': text,
                'corrected': corrected,
                'type': 'grammar'
            })
        
        return {
            'text': corrected,
            'corrections': corrections
        }
    
    def rephrase_text(self, text):
        """Generate concise, expanded, and paraphrased versions"""
        
        try:
            # Concise version
            concise_prompt = f"Rewrite the following text to be more concise and brief:\n\n{text}"
            concise = self._call_openai(concise_prompt, max_tokens=100)
            
            # Expanded version
            expanded_prompt = f"Expand and elaborate on the following text with more details:\n\n{text}"
            expanded = self._call_openai(expanded_prompt, max_tokens=200)
            
            # Paraphrased version
            paraphrase_prompt = f"Paraphrase the following text while keeping the same meaning:\n\n{text}"
            paraphrased = self._call_openai(paraphrase_prompt, max_tokens=150)
            
            return {
                'concise': concise or text[:len(text)//2],
                'expanded': expanded or f"{text}. This message conveys important information that requires attention.",
                'paraphrased': paraphrased or text
            }
        except Exception as e:
            print(f"Rephrasing error: {e}")
            # Fallback
            return {
                'concise': text[:len(text)//2] + "...",
                'expanded': f"{text}. This message contains valuable information worth considering.",
                'paraphrased': text
            }
    
    def translate_text(self, text, target_language='es'):
        """Translate text to target language"""
        
        language_names = {
            'es': 'Spanish',
            'fr': 'French',
            'de': 'German',
            'it': 'Italian',
            'pt': 'Portuguese',
            'ja': 'Japanese',
            'ko': 'Korean',
            'zh': 'Chinese'
        }
        
        try:
            prompt = f"Translate the following text to {language_names.get(target_language, target_language)}:\n\n{text}"
            translated = self._call_openai(prompt, max_tokens=200)
            
            return {
                'text': translated or text,
                'language': target_language,
                'language_name': language_names.get(target_language, target_language)
            }
        except Exception as e:
            print(f"Translation error: {e}")
            return {
                'text': text,
                'language': target_language,
                'language_name': language_names.get(target_language, target_language)
            }
    
    def get_cultural_note(self, language_code):
        """Get cultural sensitivity notes for a language"""
        
        cultural_notes = {
            'es': "In Spanish-speaking cultures, formal greetings are important. Use 'Usted' for respect.",
            'fr': "French culture values politeness. Start with 'Bonjour' and use formal 'vous' initially.",
            'de': "German business culture is formal. Use titles and last names until invited to use first names.",
            'ja': "Japanese culture emphasizes respect. Use honorifics (-san, -sama) and bow in greetings.",
            'zh': "Chinese culture values face and harmony. Indirect communication is often preferred.",
            'ko': "Korean culture has hierarchical respect. Age and position are important in communication."
        }
        
        return cultural_notes.get(language_code)
    
    def _call_openai(self, prompt, max_tokens=150):
        """Helper method to call OpenAI API"""
        try:
            response = self.openai_client.chat.completions.create(
                model="gpt-3.5-turbo",
                messages=[
                    {"role": "system", "content": "You are StyleTalk AI, a helpful assistant for text processing."},
                    {"role": "user", "content": prompt}
                ],
                max_tokens=max_tokens,
                temperature=0.7
            )
            return response.choices[0].message.content.strip()
        except Exception as e:
            print(f"OpenAI API call error: {e}")
            return None
    
    def suggest_emojis(self, text, emotion=None, context=None):
        """Suggest relevant emojis based on text, emotion, and context"""
        
        # Emoji mapping based on emotion and context
        emoji_map = {
            'joy': ['😊', '😄', '🎉', '😃', '🥳', '✨', '💫', '🌟'],
            'happy': ['😊', '😄', '🎉', '😃', '🥳', '✨', '💫', '🌟'],
            'sadness': ['😢', '😔', '💔', '😞', '😪', '🥺', '😿'],
            'sad': ['😢', '😔', '💔', '😞', '😪', '🥺', '😿'],
            'anger': ['😠', '😡', '💢', '😤', '🤬', '👿'],
            'angry': ['😠', '😡', '💢', '😤', '🤬', '👿'],
            'fear': ['😨', '😰', '😱', '😧', '🫣', '😬'],
            'surprise': ['😮', '😲', '🤯', '😯', '🙀', '😳'],
            'love': ['❤️', '💕', '💖', '💗', '💝', '💘', '💞', '🥰', '😍'],
            'gratitude': ['🙏', '🤗', '💝', '🎁', '✨', '🌟', '💖'],
            'thinking': ['🤔', '💭', '🧐', '🤨', '💡', '🔍'],
            'success': ['🎉', '🎊', '🏆', '✅', '💪', '🌟', '⭐', '🔥'],
            'celebration': ['🎉', '🎊', '🥳', '🎈', '🍾', '🎆', '🎇'],
            'professional': ['💼', '📊', '📈', '✅', '👍', '💡', '📝'],
            'question': ['❓', '🤔', '❔', '🔍', '💭'],
            'greeting': ['👋', '😊', '🙂', '✨', '🌟'],
            'farewell': ['👋', '😊', '💫', '✨', '🌟', '🫡']
        }
        
        # Get relevant emojis
        suggested_emojis = []
        
        # Add emotion-based emojis
        if emotion:
            emotion_lower = emotion.lower()
            if emotion_lower in emoji_map:
                suggested_emojis.extend(emoji_map[emotion_lower])
        
        # Add context-based emojis
        if context:
            context_lower = context.lower()
            if context_lower in emoji_map:
                suggested_emojis.extend(emoji_map[context_lower])
        
        # Analyze text for keywords
        text_lower = text.lower()
        
        # Check for specific keywords
        keyword_emojis = {
            'thanks': ['🙏', '💖', '😊'],
            'thank': ['🙏', '💖', '😊'],
            'sorry': ['🙏', '😔', '💔'],
            'congrat': ['🎉', '🥳', '🎊'],
            'love': ['❤️', '💕', '😍'],
            'work': ['💼', '📊', '💻'],
            'meeting': ['📅', '🤝', '💼'],
            'help': ['🤝', '💪', '🙏'],
            'great': ['🌟', '✨', '👍'],
            'good': ['👍', '😊', '✅'],
            'yes': ['✅', '👍', '💯'],
            'no': ['❌', '🙅', '⛔'],
            'party': ['🎉', '🥳', '🎊'],
            'birthday': ['🎂', '🎉', '🥳'],
            'food': ['🍕', '🍔', '🍰'],
            'coffee': ['☕', '☕'],
            'travel': ['✈️', '🌍', '🗺️'],
            'money': ['💰', '💵', '💸'],
            'urgent': ['🚨', '⚠️', '🔥'],
            'important': ['❗', '⚡', '🔥']
        }
        
        for keyword, emojis in keyword_emojis.items():
            if keyword in text_lower:
                suggested_emojis.extend(emojis)
        
        # Remove duplicates while preserving order
        seen = set()
        unique_emojis = []
        for emoji in suggested_emojis:
            if emoji not in seen:
                seen.add(emoji)
                unique_emojis.append(emoji)
        
        # Return top 8 emojis
        return unique_emojis[:8] if unique_emojis else ['😊', '👍', '✨', '🙏']
    
    def suggest_gifs(self, text, emotion=None, context=None):
        """Suggest relevant GIF search queries based on text, emotion, and context"""
        
        # Generate GIF search queries using AI
        try:
            prompt = f"""Based on the following message, suggest 4 relevant GIF search queries that would be appropriate as reactions or responses.
Message: "{text}"
Emotion: {emotion if emotion else 'neutral'}
Context: {context if context else 'general'}

Return only 4 GIF search queries, one per line, without numbering or explanation."""

            response = self._call_openai(prompt, max_tokens=100)
            
            if response:
                queries = [q.strip() for q in response.split('\n') if q.strip()]
                # Clean up queries (remove numbering if present)
                queries = [re.sub(r'^\d+[\.\)]\s*', '', q) for q in queries]
                return queries[:4]
        except Exception as e:
            print(f"GIF suggestion error: {e}")
        
        # Fallback: Generate queries based on emotion and keywords
        fallback_queries = []
        
        if emotion:
            fallback_queries.append(f"{emotion} reaction")
        
        # Extract keywords
        text_lower = text.lower()
        
        emotion_queries = {
            'happy': ['happy dance', 'excited', 'yay'],
            'sad': ['sad', 'crying', 'sympathy'],
            'angry': ['angry', 'frustrated', 'mad'],
            'love': ['love', 'heart', 'hug'],
            'thanks': ['thank you', 'grateful', 'appreciation'],
            'congrat': ['congratulations', 'celebrate', 'success'],
            'hello': ['hello', 'hi', 'wave'],
            'bye': ['goodbye', 'bye', 'see you']
        }
        
        for keyword, queries in emotion_queries.items():
            if keyword in text_lower:
                fallback_queries.extend(queries)
        
        # Add context-based queries
        if context and context.lower() == 'professional':
            fallback_queries.extend(['thumbs up', 'handshake', 'success'])
        else:
            fallback_queries.extend(['funny', 'cool', 'awesome'])
        
        # Remove duplicates and return top 4
        seen = set()
        unique_queries = []
        for query in fallback_queries:
            if query not in seen:
                seen.add(query)
                unique_queries.append(query)
        
        return unique_queries[:4] if unique_queries else ['happy', 'thumbs up', 'thank you', 'cool']
    
    def get_cultural_etiquette(self, language_code, context='general'):
        """Get detailed cultural etiquette tips for a specific language/culture"""
        
        etiquette_database = {
            'es': {
                'general': {
                    'greeting': 'Use "Buenos días/tardes/noches" based on time of day. Handshakes are common.',
                    'formality': 'Address people with "Señor/Señora" and use "Usted" until invited to use "tú".',
                    'communication': 'Spanish speakers value personal connections. Small talk before business is expected.',
                    'taboos': 'Avoid discussing politics, religion, or making comparisons between Spanish-speaking countries.'
                },
                'business': {
                    'greeting': 'Firm handshake, maintain eye contact. Business cards should have Spanish translation.',
                    'meetings': 'Punctuality is appreciated but flexible. Build relationships before business discussions.',
                    'communication': 'Direct but polite. Personal relationships are important in business.',
                    'dress_code': 'Conservative business attire is expected in formal settings.'
                }
            },
            'fr': {
                'general': {
                    'greeting': 'Say "Bonjour" before any interaction. Use "Monsieur/Madame" for respect.',
                    'formality': 'French culture is formal. Use "vous" until given permission to use "tu".',
                    'communication': 'French value eloquence and intellectual conversation. Directness is appreciated.',
                    'taboos': 'Avoid discussing personal income, age, or being overly casual too quickly.'
                },
                'business': {
                    'greeting': 'Handshake with direct eye contact. Wait to be invited to sit.',
                    'meetings': 'Punctuality is crucial. Prepare for detailed, intellectual discussions.',
                    'communication': 'Formal written communication. Quality and attention to detail matter.',
                    'dress_code': 'Professional, stylish attire. Appearance is important.'
                }
            },
            'de': {
                'general': {
                    'greeting': 'Firm handshake, use title + last name (Herr/Frau Schmidt).',
                    'formality': 'German culture is very formal. Use "Sie" unless invited to use "du".',
                    'communication': 'Germans value directness, efficiency, and punctuality.',
                    'taboos': 'Avoid personal questions, being late, or being too casual in professional settings.'
                },
                'business': {
                    'greeting': 'Firm handshake, use professional titles (Dr., Prof.). Exchange business cards.',
                    'meetings': 'Punctuality is mandatory. Come prepared with facts and data.',
                    'communication': 'Direct, factual, and structured. Get to the point quickly.',
                    'dress_code': 'Conservative, professional business attire.'
                }
            },
            'ja': {
                'general': {
                    'greeting': 'Bow when greeting. Use honorifics (-san, -sama). Avoid physical contact.',
                    'formality': 'Japanese culture is highly formal and hierarchical. Show respect through language.',
                    'communication': 'Indirect communication. Read between the lines. Silence is acceptable.',
                    'taboos': 'Avoid direct refusals, loud behavior, public displays of emotion, or pointing.'
                },
                'business': {
                    'greeting': 'Bow, exchange business cards with both hands. Study the card before putting it away.',
                    'meetings': 'Extreme punctuality. Group harmony is priority. Decision-making is slow.',
                    'communication': 'Indirect, respectful. "Yes" may mean "I understand" not "I agree".',
                    'dress_code': 'Conservative dark suits. Conform to group standards.'
                }
            },
            'zh': {
                'general': {
                    'greeting': 'Nod or slight bow. Handshakes are common but gentle. Use full name or title.',
                    'formality': 'Respect hierarchy and age. Address elders and superiors formally.',
                    'communication': 'Indirect communication. Saving face is crucial. Avoid causing embarrassment.',
                    'taboos': 'Avoid topics of politics, Taiwan, Tibet. Don\'t gift clocks (symbolizes death).'
                },
                'business': {
                    'greeting': 'Gentle handshake. Most senior person is greeted first. Business cards in Chinese.',
                    'meetings': 'Punctuality is important. Build relationships (guanxi) before business.',
                    'communication': 'Indirect. "Maybe" often means "no". Harmony over confrontation.',
                    'dress_code': 'Conservative attire. Avoid flashy colors or accessories.'
                }
            },
            'ko': {
                'general': {
                    'greeting': 'Bow when greeting. Younger/junior bows lower. Handshakes are acceptable.',
                    'formality': 'Korean culture is hierarchical. Age and rank determine interaction style.',
                    'communication': 'Indirect. Respect for elders is paramount. Use honorific language.',
                    'taboos': 'Don\'t refuse elder requests directly. Avoid writing names in red (means death).'
                },
                'business': {
                    'greeting': 'Bow and handshake. Present business cards with both hands.',
                    'meetings': 'Punctuality is important. Seniors speak first. Group consensus is valued.',
                    'communication': 'Building relationships is key. Social drinking (회식) is part of business culture.',
                    'dress_code': 'Conservative business attire. Appearance reflects your company.'
                }
            },
            'it': {
                'general': {
                    'greeting': 'Handshake or kiss on both cheeks (for friends). Use "Signore/Signora".',
                    'formality': 'Italians are warm but formal in business. Use "Lei" until invited to use "tu".',
                    'communication': 'Expressive, animated. Personal relationships are important.',
                    'taboos': 'Don\'t rush meals, avoid criticizing Italian culture, or being overly punctual for social events.'
                },
                'business': {
                    'greeting': 'Firm handshake, maintain eye contact. Dress impeccably.',
                    'meetings': 'Flexibility with time. Build personal relationships. Expect passionate discussions.',
                    'communication': 'Relationship-based. Style and presentation matter as much as content.',
                    'dress_code': 'Stylish, high-quality business attire. Italians value fashion.'
                }
            },
            'pt': {
                'general': {
                    'greeting': 'Handshake or kiss on cheek. Brazilians are warm and friendly.',
                    'formality': 'More relaxed than European Portuguese. Use "você" commonly.',
                    'communication': 'Personal, expressive. Brazilians value warmth and personal connection.',
                    'taboos': 'Avoid comparing Brazil to Argentina, discussing politics, or being too formal.'
                },
                'business': {
                    'greeting': 'Warm handshake, sometimes a pat on the shoulder. Build personal rapport.',
                    'meetings': 'Flexible timing. Relationship-building precedes business. Expect interruptions.',
                    'communication': 'Personal relationships are crucial. Face-to-face meetings are preferred.',
                    'dress_code': 'Business casual to formal depending on sector. Appearance matters.'
                }
            }
        }
        
        if language_code in etiquette_database:
            context_data = etiquette_database[language_code].get(context, etiquette_database[language_code]['general'])
            return {
                'language': language_code,
                'context': context,
                'tips': context_data
            }
        
        return {
            'language': language_code,
            'context': context,
            'tips': {
                'greeting': 'Research appropriate greetings for this culture.',
                'formality': 'Start formal and adjust based on the other person\'s style.',
                'communication': 'Be respectful and observe local customs.',
                'taboos': 'Research cultural sensitivities before important communications.'
            }
        }
