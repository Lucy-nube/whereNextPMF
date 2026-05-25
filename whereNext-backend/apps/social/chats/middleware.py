class SimpleJWTAuthMiddleware:
    def __init__(self, inner):
        self.inner = inner

    async def __call__(self, scope, receive, send):
        # No autenticamos aquí, solo dejamos pasar el scope intacto
        return await self.inner(scope, receive, send)
