try:
    from prisma import Prisma
    db = Prisma()
except (ImportError, RuntimeError):
    # Fallback for when Prisma client isn't generated
    class MockDB:
        def __getattr__(self, name):
            return self
        async def connect(self): pass
        async def disconnect(self): pass
        async def find_unique(self, **kwargs): return None
        async def find_many(self, **kwargs): return []
    db = MockDB()
