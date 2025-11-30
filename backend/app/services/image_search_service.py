import httpx
from typing import Optional, List, Dict, Any
import random
from ..config import settings


class ImageSearchService:
    """
    Servicio para buscar imágenes relevantes usando múltiples fuentes
    """

    def __init__(self):
        # Unsplash API - Requiere API key (gratuita)
        self.unsplash_api_key = settings.UNSPLASH_ACCESS_KEY or ""
        self.unsplash_base_url = "https://api.unsplash.com"

        # Pexels API - Alternativa gratuita
        self.pexels_api_key = settings.PEXELS_API_KEY or ""
        self.pexels_base_url = "https://api.pexels.com/v1"

    async def search_image(
        self,
        query: str,
        orientation: str = "landscape",
        size: str = "regular"
    ) -> Optional[Dict[str, Any]]:
        """
        Busca una imagen relevante para el query dado

        Args:
            query: Término de búsqueda (en español o inglés)
            orientation: Orientación de la imagen (landscape, portrait, squarish)
            size: Tamaño de la imagen (regular, small, full)

        Returns:
            Dict con información de la imagen o None si no se encuentra
        """
        # Intentar con Unsplash primero
        if self.unsplash_api_key:
            image = await self._search_unsplash(query, orientation, size)
            if image:
                return image

        # Intentar con Pexels como alternativa
        if self.pexels_api_key:
            image = await self._search_pexels(query, orientation, size)
            if image:
                return image

        # Si no hay APIs configuradas, retornar placeholder
        return self._get_placeholder_image(query, orientation)

    async def _search_unsplash(
        self,
        query: str,
        orientation: str,
        size: str
    ) -> Optional[Dict[str, Any]]:
        """Busca imagen en Unsplash"""
        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                response = await client.get(
                    f"{self.unsplash_base_url}/search/photos",
                    params={
                        "query": query,
                        "per_page": 5,
                        "orientation": orientation,
                        "content_filter": "high"
                    },
                    headers={
                        "Authorization": f"Client-ID {self.unsplash_api_key}"
                    }
                )

                if response.status_code == 200:
                    data = response.json()
                    if data.get("results") and len(data["results"]) > 0:
                        # Tomar una imagen aleatoria de los primeros resultados
                        photo = random.choice(data["results"][:3])

                        # Seleccionar el tamaño apropiado
                        url = photo["urls"].get(size, photo["urls"]["regular"])

                        return {
                            "url": url,
                            "alt": photo.get("alt_description") or photo.get("description") or query,
                            "photographer": photo["user"]["name"],
                            "photographer_url": photo["user"]["links"]["html"],
                            "source": "unsplash",
                            "download_location": photo["links"].get("download_location")
                        }
        except Exception as e:
            print(f"Error buscando en Unsplash: {e}")
            return None

    async def _search_pexels(
        self,
        query: str,
        orientation: str,
        size: str
    ) -> Optional[Dict[str, Any]]:
        """Busca imagen en Pexels"""
        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                response = await client.get(
                    f"{self.pexels_base_url}/search",
                    params={
                        "query": query,
                        "per_page": 5,
                        "orientation": orientation
                    },
                    headers={
                        "Authorization": self.pexels_api_key
                    }
                )

                if response.status_code == 200:
                    data = response.json()
                    if data.get("photos") and len(data["photos"]) > 0:
                        # Tomar una imagen aleatoria de los primeros resultados
                        photo = random.choice(data["photos"][:3])

                        # Seleccionar el tamaño apropiado
                        url_key = "large" if size == "full" else "medium"
                        url = photo["src"].get(url_key, photo["src"]["large"])

                        return {
                            "url": url,
                            "alt": query,
                            "photographer": photo["photographer"],
                            "photographer_url": photo["photographer_url"],
                            "source": "pexels"
                        }
        except Exception as e:
            print(f"Error buscando en Pexels: {e}")
            return None

    def _get_placeholder_image(
        self,
        query: str,
        orientation: str
    ) -> Dict[str, Any]:
        """
        Retorna una imagen placeholder cuando no hay APIs configuradas
        Usa servicios de placeholder gratuitos
        """
        # Dimensiones según orientación
        dimensions = {
            "landscape": "1600x900",
            "portrait": "900x1600",
            "squarish": "1200x1200"
        }

        size = dimensions.get(orientation, "1600x900")

        # Usar un servicio de placeholder con colores aleatorios
        colors = ["3b82f6", "8b5cf6", "ec4899", "f59e0b", "10b981", "6366f1"]
        color = random.choice(colors)

        # Generar un texto simple para el placeholder
        text = query[:30] if len(query) <= 30 else query[:27] + "..."

        return {
            "url": f"https://placehold.co/{size}/{color}/ffffff?text={text.replace(' ', '+')}",
            "alt": query,
            "photographer": "Placeholder",
            "photographer_url": "#",
            "source": "placeholder"
        }

    async def search_images_batch(
        self,
        queries: List[str],
        orientation: str = "landscape"
    ) -> List[Dict[str, Any]]:
        """
        Busca múltiples imágenes en batch

        Args:
            queries: Lista de términos de búsqueda
            orientation: Orientación de las imágenes

        Returns:
            Lista de dicts con información de las imágenes
        """
        images = []
        for query in queries:
            image = await self.search_image(query, orientation)
            if image:
                images.append(image)

        return images


# Instancia global del servicio
image_search_service = ImageSearchService()
