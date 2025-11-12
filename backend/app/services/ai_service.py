import httpx
from typing import Optional, Dict, Any
from ..config import settings
from ..models.activity import AIProvider

# Importaciones opcionales
try:
    from openai import AsyncOpenAI
    OPENAI_AVAILABLE = True
except ImportError:
    OPENAI_AVAILABLE = False
    AsyncOpenAI = None

try:
    import google.generativeai as genai
    GEMINI_AVAILABLE = True
except ImportError:
    GEMINI_AVAILABLE = False


class AIService:
    def __init__(self, provider: str = None, model_name: str = None):
        self.ollama_base_url = settings.OLLAMA_BASE_URL
        self.provider = provider
        self.model_name = model_name
        self.openai_client = None
        if OPENAI_AVAILABLE and settings.OPENAI_API_KEY:
            self.openai_client = AsyncOpenAI(api_key=settings.OPENAI_API_KEY)
        if GEMINI_AVAILABLE and settings.GEMINI_API_KEY:
            genai.configure(api_key=settings.GEMINI_API_KEY)

    async def generate_content(
        self,
        prompt: str,
        provider: AIProvider,
        model_name: Optional[str] = None,
        temperature: float = 0.7,
        max_tokens: int = 2000
    ) -> Dict[str, Any]:
        """
        Genera contenido usando el proveedor de AI especificado
        """
        if provider == AIProvider.OLLAMA:
            return await self._generate_ollama(prompt, model_name or "qwen2.5vl:latest", temperature)
        elif provider == AIProvider.OPENAI:
            return await self._generate_openai(prompt, model_name or "gpt-3.5-turbo", temperature, max_tokens)
        elif provider == AIProvider.GEMINI:
            return await self._generate_gemini(prompt, model_name or "gemini-pro", temperature, max_tokens)
        else:
            raise ValueError(f"Proveedor de AI no soportado: {provider}")

    async def _generate_ollama(self, prompt: str, model: str, temperature: float) -> Dict[str, Any]:
        """
        Genera contenido usando Ollama (local, sin costo de créditos)
        """
        # Timeout más largo para modelos pesados (5 minutos)
        async with httpx.AsyncClient(timeout=300.0) as client:
            try:
                url = f"{self.ollama_base_url}/api/generate"
                response = await client.post(
                    url,
                    json={
                        "model": model,
                        "prompt": prompt,
                        "stream": False,
                        "options": {
                            "temperature": temperature
                        }
                    }
                )
                response.raise_for_status()
                result = response.json()
                return {
                    "content": result.get("response", ""),
                    "model": model,
                    "credits_used": 0  # Ollama es gratis
                }
            except httpx.ConnectError as e:
                raise Exception(f"Error al comunicarse con Ollama: No se puede conectar a {self.ollama_base_url}. Asegúrate de que Ollama esté corriendo. Error: {str(e)}")
            except httpx.TimeoutException as e:
                raise Exception(f"Error al comunicarse con Ollama: Timeout después de 300 segundos. El modelo '{model}' es muy pesado para tu hardware. Prueba con un modelo más ligero como 'llama2:7b' o 'qwen3:4b'. Error: {str(e)}")
            except httpx.HTTPStatusError as e:
                raise Exception(f"Error al comunicarse con Ollama: Status {e.response.status_code}. Respuesta: {e.response.text}")
            except Exception as e:
                raise Exception(f"Error al comunicarse con Ollama: {type(e).__name__}: {str(e)}")

    async def _generate_openai(
        self,
        prompt: str,
        model: str,
        temperature: float,
        max_tokens: int
    ) -> Dict[str, Any]:
        """
        Genera contenido usando OpenAI (con costo de créditos)
        """
        if not OPENAI_AVAILABLE:
            raise Exception("OpenAI no está instalado. Instala con: pip install openai")

        if not self.openai_client:
            raise Exception("OpenAI API key no configurada. Agrega OPENAI_API_KEY en el archivo .env")

        try:
            response = await self.openai_client.chat.completions.create(
                model=model,
                messages=[
                    {"role": "system", "content": "Eres un asistente educativo experto."},
                    {"role": "user", "content": prompt}
                ],
                temperature=temperature,
                max_tokens=max_tokens
            )

            # Calcular créditos basados en tokens (ejemplo: 1 crédito por cada 100 tokens)
            total_tokens = response.usage.total_tokens
            credits_used = max(1, total_tokens // 100)

            return {
                "content": response.choices[0].message.content,
                "model": model,
                "credits_used": credits_used
            }
        except Exception as e:
            raise Exception(f"Error al comunicarse con OpenAI: {str(e)}")

    async def _generate_gemini(
        self,
        prompt: str,
        model: str,
        temperature: float,
        max_tokens: int
    ) -> Dict[str, Any]:
        """
        Genera contenido usando Google Gemini (con costo de créditos)
        """
        if not GEMINI_AVAILABLE:
            raise Exception("Google Generative AI no está instalado. Instala con: pip install google-generativeai")

        try:
            model_instance = genai.GenerativeModel(model)
            response = await model_instance.generate_content_async(
                prompt,
                generation_config={
                    "temperature": temperature,
                    "max_output_tokens": max_tokens
                }
            )

            # Calcular créditos (similar a OpenAI)
            # Esto es una estimación, ajustar según necesidad
            credits_used = 5

            return {
                "content": response.text,
                "model": model,
                "credits_used": credits_used
            }
        except Exception as e:
            raise Exception(f"Error al comunicarse con Gemini: {str(e)}")

    async def generate_chat_response(
        self,
        message: str,
        system_prompt: str = None,
        conversation_history: list = None,
        temperature: float = 0.7
    ) -> str:
        """
        Genera una respuesta de chat considerando el historial de conversación
        """
        conversation_history = conversation_history or []

        # Para Ollama, construir el prompt incluyendo el sistema y el historial
        if self.provider == "ollama":
            full_prompt = ""
            if system_prompt:
                full_prompt += f"Sistema: {system_prompt}\n\n"

            # Agregar historial de conversación
            for msg in conversation_history:
                role = "Usuario" if msg["role"] == "user" else "Asistente"
                full_prompt += f"{role}: {msg['content']}\n"

            # Agregar mensaje actual
            full_prompt += f"Usuario: {message}\nAsistente:"

            result = await self._generate_ollama(
                prompt=full_prompt,
                model=self.model_name or "qwen2.5vl:latest",
                temperature=temperature
            )
            return result["content"]

        # Para OpenAI, usar el formato de mensajes
        elif self.provider == "openai":
            if not OPENAI_AVAILABLE:
                raise Exception("OpenAI no está instalado. Instala con: pip install openai")

            if not self.openai_client:
                raise Exception("OpenAI API key no configurada")

            messages = []
            if system_prompt:
                messages.append({"role": "system", "content": system_prompt})

            # Agregar historial
            messages.extend(conversation_history)

            # Agregar mensaje actual
            messages.append({"role": "user", "content": message})

            try:
                response = await self.openai_client.chat.completions.create(
                    model=self.model_name or "gpt-3.5-turbo",
                    messages=messages,
                    temperature=temperature,
                    max_tokens=2000
                )
                return response.choices[0].message.content
            except Exception as e:
                raise Exception(f"Error al comunicarse con OpenAI: {str(e)}")

        # Para Gemini, construir el prompt de forma similar a Ollama
        elif self.provider == "gemini":
            if not GEMINI_AVAILABLE:
                raise Exception("Google Generative AI no está instalado")

            full_prompt = ""
            if system_prompt:
                full_prompt += f"Sistema: {system_prompt}\n\n"

            for msg in conversation_history:
                role = "Usuario" if msg["role"] == "user" else "Asistente"
                full_prompt += f"{role}: {msg['content']}\n"

            full_prompt += f"Usuario: {message}\nAsistente:"

            try:
                model_instance = genai.GenerativeModel(self.model_name or "gemini-pro")
                response = await model_instance.generate_content_async(
                    full_prompt,
                    generation_config={
                        "temperature": temperature,
                        "max_output_tokens": 2000
                    }
                )
                return response.text
            except Exception as e:
                raise Exception(f"Error al comunicarse con Gemini: {str(e)}")

        else:
            raise ValueError(f"Proveedor no soportado: {self.provider}")

    def get_available_models(self, provider: AIProvider) -> list[str]:
        """
        Retorna lista de modelos disponibles para cada proveedor
        """
        if provider == AIProvider.OLLAMA:
            return [
                "qwen3-embedding:0.6b",
                "qwen2.5vl:latest",
                "qwen3:4b",
                "embeddinggemma:latest",
                "deepseek-r1:8b",
                "llama2:7b-chat"
            ]
        elif provider == AIProvider.OPENAI:
            return ["gpt-3.5-turbo", "gpt-4", "gpt-4-turbo"]
        elif provider == AIProvider.GEMINI:
            return ["gemini-pro", "gemini-pro-vision"]
        return []


ai_service = AIService()
