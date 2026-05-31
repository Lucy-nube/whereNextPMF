class SimpleJWTAuthMiddleware:
    def __init__(self, inner):
        self.inner = inner

    async def __call__(self, scope, receive, send):
        # No autentico aquí, solo dejo pasar el scope intacto
        return await self.inner(scope, receive, send)
