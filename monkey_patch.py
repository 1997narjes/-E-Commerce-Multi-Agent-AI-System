import litellm

# ① Sauvegarde de la fonction ORIGINALE : On garde une référence à l'original avant de l'écraser — sinon on ne pourrait plus l'appeler.
_original_completion = litellm.completion

def _patched_completion(*args, **kwargs):
    # Supprimer cache_breakpoint des messages
    messages = kwargs.get("messages", [])
    # Intercepte TOUS les appels LLM. Récupère la liste des messages envoyés au modèle.
    for msg in messages:
        if isinstance(msg, dict):
            msg.pop("cache_breakpoint", None)
            #cache_breakpoint est une clé injectée par CrewAI pour la gestion du cache — mais Groq/LiteLLM ne la reconnaît pas et plante.
            content = msg.get("content", [])
            if isinstance(content, list):
                for block in content:
                    if isinstance(block, dict):
                        block.pop("cache_breakpoint", None)
                        #Certains messages ont un content qui est une liste de blocs (texte, images...). Le patch nettoie aussi ces niveaux profonds.
    kwargs.pop("cache_breakpoint", None)
    return _original_completion(*args, **kwargs)

litellm.completion = _patched_completion